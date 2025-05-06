import random
import joblib
import pandas as pd
import logic
from itertools import product
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, classification_report
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.losses import CategoricalCrossentropy


def generate_dataset(db, num_samples_per_type, output_file):
    types = logic.get_types(db)
    properties = [prop.name for prop in logic.get_properties(db)]
    possible_values = {
        property: logic.get_possible_values(db, property)
        for property in properties
    }
    type_properties = {
        type.name: logic.get_type_properties(db, type.id)
        for type in types
    }
    property_values = {
        f"{type_prop[0]}_{type_prop[1]}": [
            prop_value.values 
            for prop_value in logic.get_property_values_with_name(
                db,
                type_prop[0],
                type_prop[1]
                )
            ][0]
        for sublist in [
            list(product([item[0]], item[1])) 
            for item in type_properties.items()
            ]
        for type_prop in sublist
        }
    types = [type.name for type in types]

    dataset = []
    for type_name in types:
        if type_name not in type_properties:
            print(f"Warning: Свойства не определены для типа '{type_name}'.")
            continue

        for _ in range(num_samples_per_type):
            sample = {}
            for prop_name in type_properties[type_name]:
                type_prop_key = f"{type_name}_{prop_name}"

                if type_prop_key in property_values:
                    allowed_values = property_values[type_prop_key]
                    sample[prop_name] = random.choice(allowed_values)
                elif prop_name in possible_values:
                    print(
                        f"Warning: Использование возможных значений "
                        f"{type_name}.{prop_name}"
                    )
                    sample[prop_name] = random.choice(
                        possible_values[prop_name]
                    )
                else:
                    print(f"Warning: Не найдено значений для "
                          f"{type_name}.{prop_name}.")
                    sample[prop_name] = ""  # Или None

            sample["тип_предмета"] = type_name
            dataset.append(sample)

    fieldnames = properties + ["тип_предмета"]
    df = pd.DataFrame(dataset)
    available_fields = [field for field in fieldnames if field in df.columns]
    df = df[available_fields]
    df.to_csv(output_file, index=False, encoding='utf-8')
    available_fields.remove("тип_предмета")
    return [df, available_fields]


def ai_model(data, features):
    data = data.fillna("")
    print(data['тип_предмета'].value_counts())
    categorical_features = features
    print(categorical_features)
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat',
             OneHotEncoder(handle_unknown='ignore'),
             categorical_features
             ),
        ],
        remainder='passthrough'
    )

    X = data.drop('тип_предмета', axis=1)
    y = data['тип_предмета']

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y)

    y = to_categorical(y)

    X_train, X_test, y_train, y_test = train_test_split(X,
                                                        y,
                                                        test_size=0.2,
                                                        random_state=42)

    X_train = preprocessor.fit_transform(X_train)
    X_test = preprocessor.transform(X_test)

    model = Sequential([
        Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
        Dropout(0.1),
        Dense(64, activation='relu'),
        Dropout(0.1),
        Dense(32, activation='relu'),
        Dense(y_train.shape[1], activation='softmax')
    ])

    loss = CategoricalCrossentropy(label_smoothing=0.1)
    model.compile(optimizer='adam', loss=loss, metrics=['accuracy'])

    _ = model.fit(X_train,
                  y_train,
                  epochs=20,
                  batch_size=32,
                  validation_split=0.2
                  )

    y_pred = model.predict(X_test)
    y_pred_classes = y_pred.argmax(axis=1)
    y_test_classes = y_test.argmax(axis=1)

    print("Accuracy:", accuracy_score(y_test_classes, y_pred_classes))
    print(classification_report(y_test_classes, y_pred_classes))

    model.save('ai/neural_network_model_ai.h5')
    joblib.dump(label_encoder, 'ai/label_encoder_ai.pkl')
    joblib.dump(preprocessor, 'ai/preprocessor_ai.pkl')
    return [model, label_encoder, preprocessor]

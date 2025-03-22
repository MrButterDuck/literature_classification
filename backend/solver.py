from sqlalchemy.orm import Session
import models
import logic
from fastapi import HTTPException
from typing import Dict
import joblib
import pandas as pd
from tensorflow.keras.models import load_model

try:

    # Использование нейронной сети
    model = load_model("../ml/neural_network_model_ai.h5")
    label_encoder = joblib.load("../ml/label_encoder_ai.pkl")
    preprocessor = joblib.load("../ml/preprocessor_ai.pkl")

    # Использование ML
    # model = joblib.load("../ml/model.pkl")
    # label_encoder = joblib.load("../ml/label_encoder.pkl")
    # preprocessor = joblib.load("../ml/preprocessor.pkl")

except FileNotFoundError:
    model = None
    label_encoder = None
    preprocessor = None
    print("Warning: AI model or preprocessor not found. AI classification will be unavailable.")
except Exception as e:
    model = None
    label_encoder = None
    preprocessor = None
    print(f"ERROR: Failed to load AI model: {type(e).__name__}: {e}")


def classify_item(db: Session, item_data: Dict[str, str]) -> Dict:
    all_types = logic.get_types(db)
    if not all_types:
        raise HTTPException(status_code=500, detail="Internal Server Error: No types defined.")

    suitable_types = []
    explanations = []

    item_data_lower = {key.lower(): value for key, value in item_data.items()}

    for type_obj in all_types:
        type_id = type_obj.id
        type_name = type_obj.name
        type_properties = logic.get_type_properties(db, type_id)

        if not type_properties:
            explanations.append(f"Тип предмета '{type_name}' опровергнут, так как у него не определены свойства.")
            continue

        is_type_suitable = True
        for property_name in type_properties:
            property_name_lower = property_name.lower()
            if property_name_lower in item_data_lower:
                selected_value = item_data_lower[property_name_lower]
                property_obj = db.query(models.Property).filter(models.Property.name == property_name).first()
                if not property_obj:
                    continue

                property_values = logic.get_property_values(db, type_id, property_obj.id)
                allowed_values = property_values[0].values if property_values else []

                if selected_value not in allowed_values:
                    is_type_suitable = False
                    explanations.append(
                        f"Тип предмета '{type_name}' опровергнут, так как значение '{selected_value}' "
                        f"свойства '{property_name}' не соответствует описанию типа предмета."
                    )
                    break
            else:
                is_type_suitable = False
                explanations.append(
                    f"Тип предмета '{type_name}' опровергнут, так как свойство '{property_name}' "
                    f"не указано во входных данных."
                )
                break

        if is_type_suitable:
            suitable_types.append(type_name)

    if suitable_types:
        result = {
            "type": suitable_types[0] if len(suitable_types) == 1 else ", ".join(suitable_types),
            "explanation": [
                               f"Подходящие типы предмета: {', '.join(suitable_types)}."
                           ] + explanations
        }
    else:
        result = {
            "type": "Тип предмета не определён",
            "explanation": [
                               "Все гипотезы о типе предмета опровергнуты. Тип предмета не определён."
                           ] + explanations
        }

    return result

# Предсказание с помощью ML
# def classify_item_ai(item_data: Dict[str, str]) -> Dict:
#     if model is None or label_encoder is None:
#         raise HTTPException(status_code=500, detail="AI model is not available. Please check server logs.")
#
#     categorical_features = ['коллекция', 'внешний вид', 'категория', 'редкость', 'цвет', 'турнир']
#     full_item_data = {feature: item_data.get(feature, "") for feature in categorical_features}
#     input_df = pd.DataFrame([full_item_data])
#
#     try:
#         predicted_class = model.predict(input_df)[0]
#         predicted_type = label_encoder.inverse_transform([predicted_class])[0]
#         probabilities = model.predict_proba(input_df)[0]
#         prob_dict = {
#             label_encoder.inverse_transform([i])[0]: float(prob)
#             for i, prob in enumerate(probabilities)
#         }
#         explanation = [
#             f"Модель ИИ предсказала тип '{predicted_type}' на основе введённых данных.",
#             "Вероятности для каждого типа предмета приведены ниже."
#         ]
#         result = {
#             "type": predicted_type,
#             "explanation": explanation,
#             "probabilities": prob_dict
#         }
#         return result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error during AI prediction: {str(e)}")

# Предсказание с помощью ИИ
def classify_item_ai(item_data: Dict[str, str]) -> Dict:
    if model is None or label_encoder is None or preprocessor is None:
        raise HTTPException(status_code=500,
                            detail="AI model or preprocessor is not available. Please check server logs.")

    categorical_features = ['коллекция', 'внешний вид', 'категория', 'редкость', 'цвет', 'турнир']

    full_item_data = {feature: item_data.get(feature, "") for feature in categorical_features}

    input_df = pd.DataFrame([full_item_data])

    try:
        processed_data = preprocessor.transform(input_df)

        predicted_probabilities = model.predict(processed_data)[0]
        predicted_class = predicted_probabilities.argmax()
        predicted_type = label_encoder.inverse_transform([predicted_class])[0]

        prob_dict = {
            label_encoder.inverse_transform([i])[0]: float(predicted_probabilities[i])
            for i in range(len(predicted_probabilities))
        }

        explanation = [
            f"Модель ИИ предсказала тип '{predicted_type}' на основе введённых данных.",
            "Вероятности для каждого типа предмета приведены ниже."
        ]

        result = {
            "type": predicted_type,
            "explanation": explanation,
            "probabilities": prob_dict
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during AI prediction: {str(e)}")
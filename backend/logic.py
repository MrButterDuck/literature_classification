from sqlalchemy.orm import Session
import models
import schemas
from fastapi import HTTPException, status
from typing import List
from sqlalchemy.exc import IntegrityError

def get_types(db: Session) -> List[schemas.TypeOut]:
    return db.query(models.Type).all()


def create_type(db: Session, type_data: schemas.TypeCreate) -> schemas.TypeOut:
    try:
        db_type = models.Type(name=type_data.name)
        db.add(db_type)
        db.commit()
        db.refresh(db_type)
        return db_type
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Тип '{type_data.name}' уже существует.",
        )


def delete_type(db: Session, type_id: int):
    db_type = db.query(models.Type).filter(models.Type.id == type_id).first()
    if db_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тип не найден")

    try:
        db.query(models.TypeProperty).filter(models.TypeProperty.type_name == db_type.name).delete()
        db.query(models.PropertyValue).filter(models.PropertyValue.type_name == db_type.name).delete()
        db.delete(db_type)
        db.commit()
        return {"message": "Тип удален"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


def get_properties(db: Session) -> List[schemas.PropertyOut]:
    return db.query(models.Property).all()


def create_property(db: Session, property_data: schemas.PropertyCreate) -> schemas.PropertyOut:
    try:
        db_property = models.Property(name=property_data.name)
        db.add(db_property)
        db.commit()
        db.refresh(db_property)
        return db_property
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Свойство '{property_data.name}' уже существует.",
        )


def delete_property(db: Session, property_id: int):
    db_property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Свойство не найдено")
    try:
        db.query(models.PossibleValue).filter(models.PossibleValue.property_name == db_property.name).delete()
        db.query(models.TypeProperty).filter(models.TypeProperty.property_name == db_property.name).delete()
        db.query(models.PropertyValue).filter(models.PropertyValue.property_name == db_property.name).delete()
        db.delete(db_property)
        db.commit()
        return {"message": "Свойство удалено"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


def get_possible_values(db: Session, property_name: str) -> List[schemas.PossibleValueOut]:
    return db.query(models.PossibleValue).filter(models.PossibleValue.property_name == property_name).all()


def create_possible_value(db: Session, property_name: str,
                          value_data: schemas.PossibleValueBase) -> schemas.PossibleValueOut:
    db_property = db.query(models.Property).filter(models.Property.name == property_name).first()
    if not db_property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Свойство '{property_name}' не найдено")

    try:
        db_value = models.PossibleValue(property_name=property_name, value=value_data.value)
        db.add(db_value)
        db.commit()
        db.refresh(db_value)
        return db_value
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Возможное значение '{value_data.value}' для свойства '{property_name}' уже существует.",
        )


def delete_possible_value(db: Session, property_name: str, value_name: str):
    db_value = db.query(models.PossibleValue).filter(
        models.PossibleValue.property_name == property_name,
        models.PossibleValue.value == value_name
    ).first()

    if db_value is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Возможное значение не найдено")

    db.delete(db_value)
    db.commit()
    return {"message": "Возможное значение удалено"}


def get_type_properties(db: Session, type_id: int) -> List[str]:
    db_type = db.query(models.Type).filter(models.Type.id == type_id).first()
    if db_type is None:
        raise HTTPException(status_code=404, detail="Тип не найден")
    return [tp.property_name for tp in db.query(models.TypeProperty).filter(models.TypeProperty.type_name == db_type.name).all()]


def create_type_property(db: Session, type_id: int, property_name: str) -> schemas.TypePropertyOut:
    db_type = db.query(models.Type).filter(models.Type.id == type_id).first()
    if not db_type:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Тип с идентификатором '{type_id}' не найден")

    db_property = db.query(models.Property).filter(models.Property.name == property_name).first()
    if not db_property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Свойство '{property_name}' не найдено")
    try:
        db_type_property = models.TypeProperty(type_name=db_type.name, property_name=property_name)
        db.add(db_type_property)
        db.commit()
        db.refresh(db_type_property)
        return db_type_property
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Связь идентификатора типа '{type_id}' и свойства '{property_name}' уже существует"
        )


def delete_type_property(db: Session, type_id: int, property_name: str):
    db_type = db.query(models.Type).filter(models.Type.id == type_id).first()
    if db_type is None:
        raise HTTPException(status_code=404, detail="Тип не найден")

    db_type_property = db.query(models.TypeProperty).filter(
        models.TypeProperty.type_name == db_type.name,
        models.TypeProperty.property_name == property_name
    ).first()

    if db_type_property is None:
        raise HTTPException(status_code=404, detail="Свойство типа не найдено")

    db.delete(db_type_property)
    db.commit()
    return {"message": "Свойство типа удалено"}


def get_property_values(db: Session, type_id: int, property_id: int) -> List[schemas.PropertyValueOut]:
    db_type = db.query(models.Type).filter(models.Type.id == type_id).first()
    if db_type is None:
        raise HTTPException(status_code=404, detail="Тип не найден")

    db_property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Свойство не найдено")

    return db.query(models.PropertyValue).filter(
        models.PropertyValue.type_name == db_type.name,
        models.PropertyValue.property_name == db_property.name
    ).all()


def get_property_values_with_name(db: Session, type_name: str, property_name: str) -> List[schemas.PropertyValueOut]:
    db_type = db.query(models.Type).filter(models.Type.name == type_name).first()
    if db_type is None:
        raise HTTPException(status_code=404, detail="Тип не найден")

    db_property = db.query(models.Property).filter(models.Property.name == property_name).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Свойство не найдено")

    return db.query(models.PropertyValue).filter(
        models.PropertyValue.type_name == db_type.name,
        models.PropertyValue.property_name == db_property.name
    ).all()


def create_property_value(db: Session, type_id: int, property_id: int, property_value_data: schemas.PropertyValueCreate) -> schemas.PropertyValueOut:
    db_type = db.query(models.Type).filter(models.Type.id == type_id).first()
    if not db_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Тип с идентификатором '{type_id}' не найдено")

    db_property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Свойство с идентификатором '{property_id}' не найдено")

    existing_record = db.query(models.PropertyValue).filter(
        models.PropertyValue.type_name == db_type.name,
        models.PropertyValue.property_name == db_property.name
    ).first()

    try:
        if existing_record:
            new_values = property_value_data.values
            for value in new_values:
                if value in existing_record.values:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Значение '{value}' уже существует для свойства '{db_property.name}' и типа '{db_type.name}'."
                    )
            existing_record.values = existing_record.values + new_values
            db.commit()
            db.refresh(existing_record)
            return existing_record
        else:
            db_property_value = models.PropertyValue(
                type_name=db_type.name,
                property_name=db_property.name,
                values=property_value_data.values
            )
            db.add(db_property_value)
            db.commit()
            db.refresh(db_property_value)
            return db_property_value
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )



def delete_property_value(db: Session, type_id: int, property_id: int, value: str):
    db_type = db.query(models.Type).filter(models.Type.id == type_id).first()
    if not db_type:
        raise HTTPException(status_code=404, detail=f"Тип с идентификатором {type_id} не найден")

    db_property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail=f"Свойство с идентификатором {property_id} не найдено")

    db_property_value = db.query(models.PropertyValue).filter(
        models.PropertyValue.type_name == db_type.name,
        models.PropertyValue.property_name == db_property.name
    ).first()

    if not db_property_value:
        return {"message": f"Значения свойства не найдено для идентификатора типа {type_id} и идентификатора свойства  {property_id}"}

    if value in db_property_value.values:
        updated_values = list(db_property_value.values)
        updated_values.remove(value)
        db_property_value.values = updated_values
        db.commit()
        db.refresh(db_property_value)
        return {"message": f"Значение '{value}' удалено из значения свойства"}
    else:
        return {"message": f"Значение '{value}' не найдено из значения свойства"}


def check_completeness(db: Session):
    results = {"incomplete_types": [], "properties_without_values": []}

    all_types = db.query(models.Type).all()
    all_properties = db.query(models.Property).all()

    if not all_types:
        results["incomplete_types"].append({"type": "Нет типов", "reason": "типы не определены"})
    if not all_properties:
        results["properties_without_values"].append("Нет свойств")

    for type_obj in all_types:
        type_id = type_obj.id
        type_name = type_obj.name
        type_props = get_type_properties(db, type_id)

        if not type_props:
            results["incomplete_types"].append(
                {"type": type_name, "reason": "нет свойств"}
            )
            continue

        missing_value_properties = []

        for prop_name in type_props:
            db_property = db.query(models.Property).filter(models.Property.name == prop_name).first()
            if not db_property:
                raise HTTPException(status_code=500, detail=f"Internal Server Error: Свойство '{prop_name}' не найдено.")

            prop_values = get_property_values(db, type_id, db_property.id)
            if not prop_values:
                missing_value_properties.append(prop_name)

        if missing_value_properties:
            results["incomplete_types"].append(
                {
                    "type": type_name,
                    "reason": "нет значений для следующих свойств",
                    "properties": missing_value_properties
                }
            )

    for property_obj in all_properties:
        property_name = property_obj.name
        possible_values = get_possible_values(db, property_name)
        if not possible_values:
            results["properties_without_values"].append(property_name)

    return results

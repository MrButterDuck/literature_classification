from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import solver
from typing import Dict
from database import SessionLocal, engine, Base
import schemas
import logic
from pydantic import BaseModel

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ItemData(BaseModel):
    properties: Dict[str, str]


@app.post("/classify")
async def classify(item_data: ItemData, db: SessionLocal = Depends(get_db)):
    return solver.classify_item(db, item_data.properties)


@app.post("/classify-ai")
async def classify_ai(item_data: ItemData, db: SessionLocal = Depends(get_db)):
    return solver.classify_item_ai(db, item_data.properties)


@app.post("/train-ai")
async def train_ai(item_data: ItemData, db: SessionLocal = Depends(get_db)):
    return solver.retrain_model(db)


@app.post("/check-model")
def check_model(item_data: ItemData):
    return solver.check_model(item_data.properties)


@app.get("/types", response_model=List[schemas.TypeOut])
def read_types(db: SessionLocal = Depends(get_db)):
    return logic.get_types(db)


@app.post("/types", response_model=schemas.TypeOut)
def create_new_type(
        type_data: schemas.TypeCreate, 
        db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.create_type(db, type_data)


@app.delete("/types/{type_id}")
def remove_type(type_id: int, db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.delete_type(db, type_id)


@app.get("/properties", response_model=List[schemas.PropertyOut])
def read_properties(db: SessionLocal = Depends(get_db)):
    return logic.get_properties(db)


@app.post("/properties", response_model=schemas.PropertyOut)
def create_new_property(property_data: schemas.PropertyCreate,
                        db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.create_property(db, property_data)


@app.delete("/properties/{property_id}")
def remove_property(property_id: int, db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.delete_property(db, property_id)


@app.get("/possible-values/{property_name}",
         response_model=List[schemas.PossibleValueOut])
def read_possible_values(property_name: str,
                         db: SessionLocal = Depends(get_db)):
    return logic.get_possible_values(db, property_name)


@app.post("/possible-values/{property_name}",
          response_model=schemas.PossibleValueOut)
def add_possible_value(property_name: str,
                       value_data: schemas.PossibleValueBase,
                       db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.create_possible_value(db, property_name, value_data)


@app.delete("/possible-values/{property_name}/{value_name}")
def remove_possible_value(property_name: str, value_name: str,
                          db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.delete_possible_value(db, property_name, value_name)


@app.get("/type-properties/{type_id}", response_model=List[str])
def read_type_properties(type_id: int, db: SessionLocal = Depends(get_db)):
    return logic.get_type_properties(db, type_id)


@app.post("/type-properties/{type_id}", response_model=schemas.TypePropertyOut)
def add_type_property(type_id: int, property_data: schemas.TypePropertyCreate,
                      db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.create_type_property(db, type_id, property_data.property_name)


@app.delete("/type-properties/{type_id}/{property_name}")
def remove_type_property(type_id: int, property_name: str,
                         db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.delete_type_property(db, type_id, property_name)


@app.get("/property-values/{type_id}/{property_id}",
         response_model=List[schemas.PropertyValueOut])
def read_property_values(type_id: int, property_id: int,
                         db: SessionLocal = Depends(get_db)):
    return logic.get_property_values(db, type_id, property_id)


@app.post("/property-values/{type_id}/{property_id}",
          response_model=schemas.PropertyValueOut)
def add_property_value(type_id: int, property_id: int,
                       property_value_data: schemas.PropertyValueCreate,
                       db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.create_property_value(db,
                                       type_id,
                                       property_id,
                                       property_value_data)


@app.delete("/property-values/{type_id}/{property_id}/{value}")
def remove_property_value(type_id: int, property_id: int, value: str, 
                          db: SessionLocal = Depends(get_db)):
    with open('ai/is_changed.txt', 'w') as f:
            f.write('True')
    return logic.delete_property_value(db, type_id, property_id, value)


@app.get("/completeness-check")
def perform_completeness_check(db: SessionLocal = Depends(get_db)):
    return logic.check_completeness(db)


Base.metadata.create_all(bind=engine)

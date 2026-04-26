import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

STUDENT_DATA = """71222403002 ABHRO KANTH S MALE
71222403003 ABIRAMI G FEMALE
71222403004 ADAIKALASAMY V MALE
71222403005 ADHIMOOLAM A MALE
71222403006 AKALYA E FEMALE
71222403007 AKASH P MALE
71222403008 ARAVINDH P MALE
71222403010 ASHIKA S M FEMALE
71222403013 BHARATH R MALE
71222403014 CASTRO JENIFER S FEMALE
71222403015 DHANALAKSHMI B FEMALE
71222403016 DHANUSH P MALE
71222403017 DHARANI P FEMALE
71222403019 GANESH M MALE
71222403021 HARISH V MALE
71222403022 JAIARAVINDHAN C M MALE
71222403023 KALAIARASAN N MALE
71222403024 KATHIR MANIKANDAN P MALE
71222403026 KISHORE KANNAN B MALE
71222403027 KISHORE P MALE
71222403028 KISHORE S MALE
71222403029 KISHORE SELVAKUMAR MALE
71222403031 MAHA RAKESH K MALE
71222403032 MAHALAKSHMI G FEMALE
71222403034 MOHANRAJ T MALE
71222403035 MUGILAN M MALE
71222403036 NADHIYA N FEMALE
71222403037 NAGOOR SHEIK MYDEEN P MALE
71222403038 NAVANEETHA NAGARAJAN L MALE
71222403039 NAVIN B MALE
71222403040 POOPATHI C MALE
71222403041 RASHIYA S FEMALE
71222403043 RATHNA NITHI M FEMALE
71222403044 RITHANYA M FEMALE
71222403045 SAKTHIVEL A MALE
71222403046 SANJU B MALE
71222403047 SANTHOSH R MALE
71222403050 SATHISHKUMAR M MALE
71222403053 SIVA K MALE
71222403054 SIVARAJAN S MALE
71222403055 SUDHAHAR S MALE
71222403056 SUREKA K FEMALE
71222403057 SUSMITHA V FEMALE
71222403059 THAMARAISELVAN M MALE
71222403061 VISHAL K MALE
71222403063 YOGESWARAN N MALE"""

async def reset_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    
    # 1. Clear collections
    print("Clearing students, events, and registrations...")
    await db.students.delete_many({})
    await db.events.delete_many({})
    await db.registrations.delete_many({})
    
    # 2. Set up unique index for register_number (The ultimate primary key)
    # Note: email + register_number compound index ensures the pair is unique
    await db.students.create_index([("register_number", 1)], unique=True)
    
    # 3. Parse and Import
    students = []
    lines = STUDENT_DATA.strip().split('\n')
    for line in lines:
        parts = line.split(' ')
        reg_no = parts[0]
        name = " ".join(parts[1:-1])
        # Generate a unique email based on reg number as requested
        email = f"{reg_no.lower()}@college.edu"
        
        students.append({
            "register_number": reg_no,
            "full_name": name,
            "department": "CSE",
            "year": 2,
            "email": email
        })
    
    if students:
        await db.students.insert_many(students)
        print(f"Successfully imported {len(students)} students into cloud database.")
    
    print("Database reset and import complete.")
    client.close()

if __name__ == "__main__":
    asyncio.run(reset_db())

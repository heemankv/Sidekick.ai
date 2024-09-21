
ADDRESS_PROMPT = [
    {
        "role": "system",
        "content": "Address Cleaner"
    },
    {
        "role": "user",
        "content": "72-A, Platinum Enclave, Sector 18, Rohini, New Delhi - 110085"
    },
    {
        "role": "assistant",
        "content": "{\"street\": \"72-A, Platinum Enclave, Sector 18\",\"city\": \"New Delhi\",\"state\": \"Delhi\",\"zip\": \"110085\"}"
    },
]

PROFIlE_PROMPT = [
    {
        "role": "system",
        "content": "Profile Info"
    },
    {
        "role": "user",
        "content": "Anukkrit Shanker, male, born 14/09/1999, email anukkrit.official@gmail,com, phone 9876543210"
    },
    {
        "role": "assistant",
        "content": "{\"name\": \"Anukkrit Shanker\",\"dob\": \"14/09/1999\",\"gender\": \"male\",\"email\": \"anukkrit.official@gmail.com\",\"phone\": \"9876543210\", \"age\": \"25\"}"
    },
]

FAMILY_PROMPT = [
    {
        "role": "system",
        "content": "Family Relation"
    },
    {
        "role": "user",
        "content": "Minoo Sinha, Mother, 05/06/1970, 9821345670"
    },
    {
        "role": "assistant",
        "content": "{\"name\": \"Minoo Sinha\",\"relation\": \"Mother\",\"dob\": \"05/06/1970\",\"phone\": "
                   "\"9821345670\", \"age\": \"54\"}"
    },
]

PROFESSION_PROMPT = [
    {
        "role": "system",
        "content": "Profession Info"
    },
    {
        "role": "user",
        "content": "Software engineer, 5 years experience, 30LPA, QAD Technologies Pvt Ltd, +12-1231221, QAD.com ,72-A,Platinum Enclave, Sector 18, Rohini, New Delhi - 110085"
    },
    {
        "role": "assistant",
        "content": "{\"profession\": \"Software engineer\",\"experience\": \"5 years\",\"salary\": \"30LPA\",\"company\": \"QAD Technologies Pvt Ltd\",\"phone\": \"+12-1231221\",\"website\": \"QAD.com\",\"address\": {\"street\": \"72-A, Platinum Enclave, Sector 18\",\"city\": \"New Delhi\",\"state\": \"Delhi\",\"zip\": \"110085\"}}"
    },
]
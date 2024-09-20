from time import sleep
from selenium import webdriver
import uvicorn
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from helpers import *
from fastapi import FastAPI

app = FastAPI()


# website url : https://india-pan.netlify.app
def get_website_driver() :
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get("https://india-pan.netlify.app")
    return driver


def fill(json : dict, driver: webdriver.Chrome) : 
    # fill Whether citizen of India
    fill_radio_button(driver, "indian-citizen-yes")
    # fill Name
    # title 
    fill_radio_button(driver, json["designation"])
    fill_input_field(driver, "last-name", json["last-name"])
    fill_input_field(driver, "first-name", json["first-name"])
    fill_input_field(driver, "middle-name", json["middle-name"])
    fill_radio_button(driver, json["full-name"])
    fill_radio_button(driver, json["single-mom"])

    # Father Name
    fill_checkbox(driver, "father-name-checkbox")
    fill_input_field(driver, "father-last-name", json["father-last-name"])
    fill_input_field(driver, "father-first-name", json["father-first-name"])
    fill_input_field(driver, "father-middle-name", json["father-middle-name"])

    # Mother Name
    fill_checkbox(driver, "mother-name-checkbox")
    fill_input_field(driver, "mother-last-name", json["mother-last-name"])
    fill_input_field(driver, "mother-first-name", json["mother-first-name"])
    fill_input_field(driver, "mother-middle-name", json["mother-middle-name"])

    # Select Parent name which is to be printed on the card
    fill_radio_button(driver, json["parent-priority"])

    # Date of Birth
    fill_input_field(driver, "date-input", json["dd"])
    fill_input_field(driver, "month-input", json["mm"])
    fill_input_field(driver, "year-input", json["yyyy"])

    # Gender
    fill_radio_button(driver, json["gender"])

    # # Address for Communication
    fill_radio_button(driver, json["address-priority"])
    fill_input_field(driver, "office-name", json["office-name"]) 
    fill_input_field(driver, "flat-door-block-no", json["flat-door-block-no"])
    fill_input_field(driver, "name-of-premises", json["name-of-premises"])
    fill_input_field(driver, "road-street-lane-post-office", json["road-street-lane-post-office"])
    fill_input_field(driver, "area-locality-taluka-sub-division", json["area-locality-taluka-sub-division"])
    fill_input_field(driver, "town-city-district", json["town-city-district"])
    fill_input_field(driver, "state-union-territory", json["state-union-territory"])
    fill_input_field(driver, "pin-input", json["pin-input"])
    fill_input_field(driver, "country-select", json["country"])

    # Contact details 
    if json["telephone-no-checkbox"]:
        fill_checkbox(driver, "telephone-no-checkbox")
    
    fill_option_field(driver, "country-code", json["country-code"])

    fill_radio_button(driver, json["mobile-no-radio"])

    fill_input_field(driver, "email-id-input", json["email-id"])

    if json["aadhaar-radio"]:
        fill_radio_button(driver, json["aadhaar-radio"])
    
    fill_input_field(driver, "aadhaar-number-input", json["aadhaar-number-input"])
    fill_input_field(driver, "aadhaar-name-input", json["aadhaar-name-input"])

    fill_input_field(driver, "verification-input", json["verification-input"])




def run_selenium_bot(json: dict) :
    website_driver = get_website_driver()
    fill(json, website_driver)
    sleep(10)





def main() :

    json = {
        # add realistic values
            "designation" : "father-name-checkbox",
            "last-name" : "Kumar",
            "first-name" : "Rajesh",
            "middle-name" : "Kumar",
            "full-name" : "full-name",
            "single-mom" : "single-mom-yes",
            "father-last-name" : "Kumar",
            "father-first-name" : "Rajesh",
            "father-middle-name" : "Kumar",
            "mother-last-name" : "Kumari",
            "mother-first-name" : "Rajesh",
            "mother-middle-name" : "Kumar",
            "parent-priority" : "father-name-radio",
            "dd" : "02",
            "mm" : "02",
            "yyyy" : "2002",
            "gender" : "male-radio",
            "address-priority" : "residential-radio",
            "office-name" : "Karnot",
            "flat-door-block-no" : "101",
            "name-of-premises" : "Sadbhawana",
            "road-street-lane-post-office" : "Carrot Street",
            "area-locality-taluka-sub-division" : "Kuala Lumpur",
            "town-city-district" : "Kakarot",
            "state-union-territory" : "Kerala",
            "pin-input" : "110011",
            "country" : "India",
            
            "country-code" : "91",
            "email-id" : "rajeshkumar@gmail.com",

            "aadhaar-radio" : "aadhaar-radio",
            "aadhaar-number-input" : "123456789012",
            "aadhaar-name-input" : "Rajesh Kumar",
            "verification-input" : "Rajesh Kumar",
        }

    run_selenium_bot(json)


if __name__ == "__main__":
    main()


# def main() :

#     @app.get("/")
#     async def root():
#         return {"message": "Hello World"}


#     @app.post("/run")
#     async def run(body: dict):
#         # create json : 
#         json = {
#             "designation" : "father-name-checkbox",
#             "last-name" : "last-name",
#             "first-name" : "first-name",
#             "middle-name" : "middle-name",
#             "full-name" : "full-name",
#             "single-mom" : "single-mom",
#             "father-last-name" : "father-last-name",
#             "father-first-name" : "father-first-name",
#             "father-middle-name" : "father-middle-name",
#             "mother-last-name" : "mother-last-name",
#             "mother-first-name" : "mother-first-name",
#             "mother-middle-name" : "mother-middle-name",
#             "parent-priority" : "parent-priority",
#             "dd" : "02",
#             "mm" : "02",
#             "yyyy" : "2002",
#             "gender" : "gender",
#         }

#         hash = run_selenium_bot(json)
#         return {"hash": hash}
    

#     return app


# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)

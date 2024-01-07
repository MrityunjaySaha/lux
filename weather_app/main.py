import datetime as dt 
import requests

BASE_URL = "http://api.openweathermap.org/data/2.5/weather?"
API_KEY = "d3e5840bbceeb544d4880c1397da1df6"
CITY = "Portland"

def kelvin_to_celsius_fahrenheit(kelvin):
    celsius = kelvin -273.15
    fahrenheit = celsius * (9/5) + 32
    return celsius, fahrenheit

url = BASE_URL + "appid=" + API_KEY + "&q=" + CITY
response = requests.get(url).json()

temp_kelvin = response['main']['temp']
temp_celsius, temp_fahrenheit = kelvin_to_celsius_fahrenheit(temp_kelvin)
feels_like_kelvin = response['main']['feels_like']
feels_like_celsius, feels_like_fahrenheit = kelvin_to_celsius_fahrenheit(feels_like_kelvin)
wind_speed = response['wind']['speed']
humidity = response['main']['humidity']
description = response['weather'][0]['description']
sunrise_time = dt.datetime.fromtimestamp(response['sys']['sunrise'] + response['timezone'])
sunset_time = dt.datetime.fromtimestamp(response['sys']['sunset'] + response['timezone'])

print(f"Temperature in {CITY}: {temp_celsius:.2f} Degree C or {temp_fahrenheit} Degree F")
print(f"Temperature in {CITY} feels like: {feels_like_celsius:.2f} Degree C or {feels_like_fahrenheit:.2f} Degree F")
print(f"Humidity in {CITY}: {humidity}%")
print(f"Wind Speed in {CITY}: {wind_speed}m/s")
print(f"General weather in {CITY}: {description}")
print(f"Sun rises in {CITY}: {sunrise_time} local time.")
print(f"Sun sets in {CITY}: {sunset_time} local time.")
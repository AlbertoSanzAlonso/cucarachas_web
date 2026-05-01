import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('GOOGLE_API_KEY')
if not api_key:
    print("Error: No GOOGLE_API_KEY found in environment.")
    exit(1)

genai.configure(api_key=api_key)

print(f"Checking models for API Key: {api_key[:10]}...")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model Name: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")

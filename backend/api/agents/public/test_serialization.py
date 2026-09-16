import os
import django
from pydantic import BaseModel
from typing import List, Optional

# Setup django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.agents.models import AgentState
from pydantic_ai.messages import ModelRequest, UserPromptPart, TextPart

def test_serialization():
    print("Testing AgentState serialization...")
    
    # Simular historial de mensajes
    history = [
        {
            "role": "user",
            "content": "hola"
        }
    ]
    
    try:
        state = AgentState(history=history)
        dumped = state.model_dump()
        print("✅ Model dump successful")
        
        validated = AgentState.model_validate(dumped)
        print("✅ Model validate successful")
        print(f"History content: {validated.history}")
        
    except Exception as e:
        print(f"❌ Serialization failed: {str(e)}")

if __name__ == "__main__":
    test_serialization()

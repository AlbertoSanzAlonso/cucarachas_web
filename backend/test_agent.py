import os
import django
import asyncio

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.agents.public.case_synthesizer import case_synthesizer_agent

async def test_agent():
    print("--- Test 1: Consulta sobre cucarachas en la cocina ---")
    result = await case_synthesizer_agent.run("Tinc unes paneroles petites a la cuina, dalt dels motors de la nevera. Què em recomanes?")
    
    print(f"\nExplicació: {result.output.explanation}")
    print("\nTractaments Recomanats:")
    for t in result.output.recommended_treatments:
        print(f"- {t.name} ({t.price}€): {t.description}")
    print(f"\nPropers Passos: {result.output.next_steps}")

if __name__ == "__main__":
    asyncio.run(test_agent())

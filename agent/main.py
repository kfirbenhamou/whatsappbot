"""
Daily WhatsApp AI Agent
-----------------------
Generates a personalised daily message with OpenAI gpt-4o-mini and
sends it to your wife via the Node.js whatsapp-web.js bridge.

Required environment variables (set in .env locally or GitHub Secrets in CI):
  OPENAI_API_KEY  - your OpenAI API key
  WIFE_PHONE      - recipient in WhatsApp format, e.g. "972501234567@c.us"
"""

import os
import subprocess
import sys
from datetime import date

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def generate_message() -> str:
    """Ask gpt-4o-mini to write a short, unique daily message."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY environment variable is not set.")

    client = OpenAI(api_key=api_key)

    today = date.today().strftime("%A, %B %d %Y")  # e.g. "Sunday, March 22 2026"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You write short, warm, creative daily WhatsApp messages from a husband to his wife. "
                    "Each message should feel personal and unique — never generic. "
                    "Keep it under 3 sentences. No emojis unless they feel natural. "
                    "Never start two messages the same way."
                ),
            },
            {
                "role": "user",
                "content": f"Today is {today}. Write a sweet good morning message for my wife.",
            },
        ],
        temperature=0.9,  # higher temperature = more creative variety
        max_tokens=120,
    )

    return response.choices[0].message.content.strip()


def send_via_bridge(message: str) -> None:
    """Pass the message to the Node.js whatsapp-web.js bridge."""
    phone = os.getenv("WIFE_PHONE")
    if not phone:
        raise EnvironmentError("WIFE_PHONE environment variable is not set.")

    env = os.environ.copy()
    env["MESSAGE"] = message
    env["WIFE_PHONE"] = phone

    result = subprocess.run(
        ["node", "whatsapp/send.js"],
        env=env,
        capture_output=False,  # stream stdout/stderr directly so CI logs show it
    )

    if result.returncode != 0:
        print(f"Bridge exited with code {result.returncode}", file=sys.stderr)
        sys.exit(result.returncode)


def main() -> None:
    print("Generating daily message...")
    message = generate_message()
    print(f"Message: {message}")

    print("Sending via WhatsApp bridge...")
    send_via_bridge(message)

    print("Done.")


if __name__ == "__main__":
    main()

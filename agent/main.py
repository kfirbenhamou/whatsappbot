"""
Daily Telegram AI Agent
-----------------------
Generates a personalised daily message with OpenAI gpt-4o-mini and
sends it to your Telegram account via the Telegram Bot API.

Required environment variables (set in .env locally or GitHub Secrets in CI):
  OPENAI_API_KEY       - your OpenAI API key
  TELEGRAM_BOT_TOKEN   - token from @BotFather
  TELEGRAM_CHAT_ID     - your Telegram user/chat ID
"""

import os
import sys
from datetime import date

import httpx
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def generate_message() -> str:
    """Ask gpt-4o-mini to write a short, unique daily message."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY environment variable is not set.")

    client = OpenAI(api_key=api_key, http_client=httpx.Client(verify=False))

    today = date.today().strftime("%A, %B %d %Y")  # e.g. "Sunday, March 22 2026"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You write short, warm, creative daily messages from a husband to his wife. "
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


def send_via_telegram(message: str) -> None:
    """Send the message to a Telegram chat via the Bot API."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")

    if not token:
        raise EnvironmentError("TELEGRAM_BOT_TOKEN environment variable is not set.")
    if not chat_id:
        raise EnvironmentError("TELEGRAM_CHAT_ID environment variable is not set.")

    resp = httpx.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={"chat_id": chat_id, "text": message},
        verify=False,  # bypasses corporate proxy SSL inspection
        timeout=30,
    )

    try:
        resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        print(f"Telegram API error: {resp.text}", file=sys.stderr)
        raise e

    print(f"Message sent to chat {chat_id} via Telegram.")


def main() -> None:
    print("Generating daily message...")
    message = generate_message()
    print(f"Message: {message}")

    print("Sending via Telegram...")
    send_via_telegram(message)

    print("Done.")


if __name__ == "__main__":
    main()

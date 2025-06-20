import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
import django
import os
import sys

load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "healthcare_backend.settings")
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")
django.setup()

from api.models import TelegramUser

logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
if BOT_TOKEN is None:
    raise ValueError("TELEGRAM_BOT_TOKEN environment variable is not set.")

@sync_to_async
def get_or_create_user(username):
    return TelegramUser.objects.get_or_create(telegram_username=username)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    username = update.effective_user.username if update.effective_user else None
    chat_id = update.effective_chat.id if update.effective_chat else None

    if username and chat_id:
        obj, created = await get_or_create_user(username)
        message = "Welcome! Your Telegram username has been saved." if created else "You are already registered!"
        await context.bot.send_message(chat_id=chat_id, text=message)
    elif chat_id:
        await context.bot.send_message(chat_id=chat_id, text="No Telegram username found. Please set one in your Telegram settings.")

def run_telegram_bot():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("Telegram bot is running...")
    app.run_polling()


if __name__ == "__main__":
    run_telegram_bot()

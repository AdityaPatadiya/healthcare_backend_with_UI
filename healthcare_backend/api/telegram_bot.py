import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
import django
import os
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "healthcare_backend.settings")
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")
django.setup()

from api.models import TelegramUser

logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
if BOT_TOKEN is None:
    raise ValueError("TELEGRAM_BOT_TOKEN environment variable is not set.")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    username = update.effective_user.username if update.effective_user else None
    chat_id = update.effective_chat.id if update.effective_chat else None

    if username and chat_id:
        obj, created = TelegramUser.objects.get_or_create(telegram_username=username)
        message = "Welcome! Your Telegram username has been saved." if created else "You are already registered!"
        await context.bot.send_message(chat_id=chat_id, text=message)
    elif chat_id:
        message = "No Telegram username found. Please set one in your Telegram settings."
        await context.bot.send_message(chat_id=chat_id, text=message)
    else:
        logging.warning("No chat_id found in update. Cannot send message.")

def run_telegram_bot():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("Telegram bot is running...")
    app.run_polling()

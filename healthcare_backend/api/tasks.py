from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_welcome_email(email):
    send_mail(
        subject="welcome to the Healthcare System",
        message="Thank you for registeting with us!",
        from_email="aadityasoni901@gmail.com",
        recipient_list=[email],
        fail_silently=False,
    )

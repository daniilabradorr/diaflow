from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from pacientes.models import Paciente


@receiver(post_save, sender=User)
def crear_paciente_automatico(sender, instance, created, **kwargs):
    if created:
        # al crear un nuevo usuario, creo un Paciente vinculado
        Paciente.objects.create(usuario=instance, nombre=instance.username)

# Generated by Django 5.1.6 on 2025-02-27 17:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appbackend', '0008_alter_challenge_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='users',
            name='name',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]

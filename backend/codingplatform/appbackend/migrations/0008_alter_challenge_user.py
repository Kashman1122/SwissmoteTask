# Generated by Django 5.1.6 on 2025-02-27 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appbackend', '0007_alter_challenge_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='challenge',
            name='user',
            field=models.CharField(default='xyz', max_length=200),
        ),
    ]

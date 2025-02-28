from django.urls import path
from . import views

urlpatterns=[
    path('index/',views.index,name="index"),
    path('register/',views.register,name="register"),
    path('challenge/',views.challenge,name="challenge"),
 # User progress URLs
    path('api/progress/', views.get_user_progress, name='get_user_progress'),
    path('api/progress/submit/', views.submit_user_progress, name='submit_user_progress'),
    path('api/stats/<int:user_id>/', views.get_user_stats, name='get_user_stats'),
    path('submissions/',views.submissions,name="submissions")
]

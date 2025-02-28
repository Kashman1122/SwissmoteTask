from django.contrib import admin
from .models import Challenge, UserProgress

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'points', 'category', 'created_at')
    list_filter = ('difficulty', 'category', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
    fieldsets = (
        ("Basic Information", {
            'fields': ('title', 'description', 'difficulty', 'points', 'category')
        }),
        ("Validation", {
            'fields': ('expected_output', 'test_cases', 'validation_type')
        }),
        ("Metadata", {
            'fields': ('created_at',)
            ,'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'status', 'attempts', 'completed_at')
    list_filter = ('status', 'completed_at')
    search_fields = ('user__username', 'challenge__title')
    ordering = ('-completed_at',)
    readonly_fields = ('completed_at',)

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404
from .models import Challenge, Category  # Ensure models are imported



def index(request):
    return render(request,'index.html')


@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return JsonResponse({"error": "All fields are required!"}, status=400)

        # Check if username already exists
        if User.objects.filter(username=name).exists():
            return JsonResponse({"error": "Username already exists!"}, status=400)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already exists!"}, status=400)

        user = User.objects.create_user(username=name, email=email, password=password)

        return JsonResponse({"message": "Registration successful!", "username": user.username}, status=201)

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Challenge, Category
from django.contrib.auth.models import User

@csrf_exempt
def challenge(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # ✅ Check for required fields
            required_fields = ["user", "title", "description", "difficulty", "points", "category"]
            for field in required_fields:
                if field not in data or not str(data[field]).strip():
                    return JsonResponse({"error": f"Missing field: {field}"}, status=400)

            # ✅ Handle Category DoesNotExist Error
            try:
                category = Category.objects.get(name=data["category"].strip().lower())
            except Category.DoesNotExist:
                return JsonResponse({"error": "Category not found"}, status=400)

            # ✅ Create Challenge
            challenge = Challenge.objects.create(
                user=data["user"].strip(),
                title=data["title"],
                description=data["description"],
                difficulty=data["difficulty"],
                points=int(data["points"]),
                category=category,
                expected_output=data.get("expected_output", ""),
                test_cases=json.loads(data.get("test_cases", "{}")),  # ✅ Ensure test_cases is a list
                validation_type=data.get("validation_type", "exact_match")
            )

            return JsonResponse({"message": "Challenge created successfully", "challenge_id": challenge.id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    elif request.method == "GET":
        challenges = Challenge.objects.all().order_by("-created_at")

        challenges_list = [
            {
                "id": challenge.id,
                "title": challenge.title,
                "description": challenge.description,
                "difficulty": challenge.difficulty,
                "points": challenge.points,
                "category": challenge.category.name,
                "expected_output": challenge.expected_output,
                "test_cases": challenge.test_cases,
                "validation_type": challenge.validation_type,
                "created_at": challenge.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for challenge in challenges
        ]

        return JsonResponse(challenges_list, safe=False)

    return JsonResponse({"error": "Invalid request method"}, status=405)



@csrf_exempt
def submissions(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            challenge_id = data.get("challengeId")
            code = data.get("code")
            language = data.get("language")
            print(language)
            if not challenge_id or not code or not language:
                return JsonResponse({"error": "Missing required fields."}, status=400)
            
            # Execute the submitted code
            result = execute_code(code, language)
            return JsonResponse(result)
        
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data."}, status=400)
    
    return JsonResponse({"error": "Invalid request method."}, status=405)


# views.py
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json
from django.contrib.auth.models import User
from .models import UserProgress, Challenge


@csrf_exempt
def get_user_progress(request):
    """
    Fetch user progress based on the provided user ID.
    Optional filters: challenge ID, status
    """
    user_id = request.GET.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'User ID is required'}, status=400)
    
    user = get_object_or_404(User, id=user_id)
    
    # Fetch query parameters for filtering (optional)
    challenge_id = request.GET.get('challenge_id')
    status = request.GET.get('status')
    
    # Filter progress records
    progress_query = UserProgress.objects.filter(user=user)
    if challenge_id:
        progress_query = progress_query.filter(challenge_id=challenge_id)
    if status:
        progress_query = progress_query.filter(status=status)
    
    # Serialize the results
    progress_data = [
        {
            'challenge': progress.challenge.title,
            'challenge_id': progress.challenge.id,
            'status': progress.status,
            'attempts': progress.attempts,
            'completed_at': progress.completed_at.isoformat() if progress.completed_at else None
        }
        for progress in progress_query
    ]
    
    return JsonResponse({'user': user.username, 'progress': progress_data})

@csrf_exempt
@require_http_methods(["POST"])
def submit_user_progress(request):
    """
    Submit a new attempt for a challenge and update the user progress.
    Uses the Challenge.validate_submission and UserProgress.submit_attempt methods.
    """
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        challenge_id = data.get('challenge_id')
        submission_content = data.get('submission_content')
        
        if not user_id or not challenge_id or not submission_content:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        user = get_object_or_404(User, id=user_id)
        challenge = get_object_or_404(Challenge, id=challenge_id)
        
        # Get or create the progress record
        user_progress, created = UserProgress.objects.get_or_create(
            user=user,
            challenge=challenge,
            defaults={'status': 'started'}
        )
        
        # Submit the attempt using existing model method
        is_valid, feedback = user_progress.submit_attempt(submission_content)
        
        return JsonResponse({
            'success': True,
            'user': user.username,
            'challenge': challenge.title,
            'status': user_progress.status,
            'attempts': user_progress.attempts,
            'is_valid': is_valid,
            'feedback': feedback
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_user_stats(request, user_id):
    """
    Get user statistics including completed challenges, total points earned, etc.
    """
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Get all completed challenges
        completed_progress = UserProgress.objects.filter(
            user=user,
            status='completed'
        ).select_related('challenge')
        
        # Calculate statistics
        total_challenges = UserProgress.objects.filter(user=user).count()
        completed_challenges = completed_progress.count()
        attempted_challenges = UserProgress.objects.filter(
            user=user, 
            status__in=['started', 'submitted']
        ).count()
        
        # Calculate total points earned
        total_points = sum(progress.challenge.points for progress in completed_progress)
        
        # Get challenges by category
        challenges_by_category = {}
        for progress in completed_progress:
            category_name = progress.challenge.category.name
            if category_name not in challenges_by_category:
                challenges_by_category[category_name] = 0
            challenges_by_category[category_name] += 1
        
        return JsonResponse({
            'username': user.username,
            'total_challenges': total_challenges,
            'completed_challenges': completed_challenges,
            'attempted_challenges': attempted_challenges,
            'completion_rate': (completed_challenges / total_challenges * 100) if total_challenges > 0 else 0,
            'total_points': total_points,
            'challenges_by_category': challenges_by_category
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
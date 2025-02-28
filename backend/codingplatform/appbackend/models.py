from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import json
import re


#for user registration
class Users(models.Model):
    name=models.CharField(max_length=100,unique=True)
    email=models.CharField(max_length=100)
    password=models.CharField(max_length=100)

class Category(models.Model):  # Define Category first
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Challenge(models.Model):
    user = models.CharField(max_length=200,null=False,default="xyz")
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(
        max_length=20,
        choices=[('beginner', 'Beginner'),
                 ('intermediate', 'Intermediate'),
                 ('advanced', 'Advanced')]
    )
    points = models.IntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)  # Common key
    created_at = models.DateTimeField(auto_now_add=True)
    
    expected_output = models.TextField(blank=True, null=True)
    test_cases = models.JSONField(default=list, blank=True, null=True)
    validation_type = models.CharField(
        max_length=20,
        choices=[
            ('exact_match', 'Exact Match'),
            ('regex_match', 'Regex Match'),
            ('code_execution', 'Code Execution'),
            ('manual_review', 'Manual Review')
        ],
        default='exact_match'
    )

    def __str__(self):
        return self.title

    
    def validate_submission(self, submission, user_progress=None):
        """
        Validates a user's submission against the challenge criteria.
        Returns (is_valid, feedback) tuple where:
        - is_valid: Boolean indicating if submission passed validation
        - feedback: String with detailed feedback about the submission
        """
        if not user_progress:
            # If UserProgress not provided, try to find it
            try:
                from .models import UserProgress  # Import here to avoid circular imports
                user_progress = UserProgress.objects.get(
                    user=submission.user,
                    challenge=self
                )
                # Update attempt count
                user_progress.attempts += 1
                user_progress.save()
            except (UserProgress.DoesNotExist, AttributeError):
                pass  # Continue without UserProgress
        
        # Get submission content (adjust this based on your submission structure)
        submission_content = submission.content if hasattr(submission, 'content') else submission
        
        # Validation logic based on validation_type
        if self.validation_type == 'exact_match':
            is_valid = self._validate_exact_match(submission_content)
            feedback = "Submission matches expected output." if is_valid else "Submission does not match expected output."
            
        elif self.validation_type == 'regex_match':
            is_valid = self._validate_regex_match(submission_content)
            feedback = "Submission format is correct." if is_valid else "Submission format is incorrect."
            
        elif self.validation_type == 'code_execution':
            is_valid, feedback = self._validate_code_execution(submission_content)
            
        elif self.validation_type == 'manual_review':
            is_valid = False  # Default to false until manually reviewed
            feedback = "Your submission has been received and is pending manual review."
        
        else:
            is_valid = False
            feedback = "Unknown validation type."
        
        # Update UserProgress if submission is valid and UserProgress exists
        if is_valid and user_progress:
            user_progress.status = 'completed'
            user_progress.completed_at = timezone.now()
            user_progress.save()
        
        return is_valid, feedback
    
    def _validate_exact_match(self, submission_content):
        """Validates submission by exact string comparison with expected output"""
        return submission_content.strip() == self.expected_output.strip()
    
    def _validate_regex_match(self, submission_content):
        """Validates submission using regular expression pattern matching"""
        try:
            pattern = re.compile(self.expected_output, re.DOTALL)
            return bool(pattern.match(submission_content))
        except re.error:
            return False
    
    def _validate_code_execution(self, submission_content):
        """
        Validates submission by running test cases against submitted code
        Returns (is_valid, detailed_feedback) tuple
        """
        if not self.test_cases:
            return False, "No test cases defined for this challenge."
        
        # Track test case results
        test_results = []
        passed_tests = 0
        total_tests = len(self.test_cases)
        
        for i, test_case in enumerate(self.test_cases):
            try:
                # This is a simplified placeholder for code execution
                # In a real implementation, you would use a sandbox environment
                # or run tests in isolation for security
                
                # Example structure for test_cases:
                # [{"input": "test input", "expected": "expected output"}, ...]
                
                # Simulated test execution result
                test_input = test_case.get('input', '')
                expected = test_case.get('expected', '')
                
                # This would be replaced with actual code execution logic
                # For example, using a sandbox or Docker container
                actual_output = self._execute_code(submission_content, test_input)
                
                test_passed = actual_output.strip() == expected.strip()
                if test_passed:
                    passed_tests += 1
                
                test_results.append({
                    'test_number': i + 1,
                    'passed': test_passed,
                    'input': test_input,
                    'expected': expected,
                    'actual': actual_output
                })
                
            except Exception as e:
                test_results.append({
                    'test_number': i + 1,
                    'passed': False,
                    'input': test_case.get('input', ''),
                    'expected': test_case.get('expected', ''),
                    'actual': f"Error: {str(e)}"
                })
        
        # Determine if submission passed overall
        is_valid = passed_tests == total_tests
        
        # Generate detailed feedback
        feedback = f"Passed {passed_tests} out of {total_tests} tests.\n\n"
        
        for result in test_results:
            status = "✓" if result['passed'] else "✗"
            feedback += f"Test {result['test_number']}: {status}\n"
            if not result['passed']:
                feedback += f"Input: {result['input']}\n"
                feedback += f"Expected: {result['expected']}\n"
                feedback += f"Actual: {result['actual']}\n\n"
        
        return is_valid, feedback
    
    def _execute_code(self, code, test_input):
        """
        Placeholder for code execution logic.
        In production, this would be implemented with proper sandboxing.
        """
        # This is just a placeholder - DO NOT use exec() in production
        # You would use a proper sandboxed environment
        return "Simulated output"


# progress/models.py
class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[('started', 'Started'),
                ('submitted', 'Submitted'),
                ('completed', 'Completed')]
    )
    attempts = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'challenge']
        
    def __str__(self):
        return f"{self.user.username} - {self.challenge.title} - {self.status}"
    
    def submit_attempt(self, submission_content):
        """
        Process a submission attempt for this challenge
        Returns the validation result and feedback
        """
        self.attempts += 1
        self.status = 'submitted'
        self.save()
        
        # Pass the submission to the challenge for validation
        is_valid, feedback = self.challenge.validate_submission(submission_content, self)
        
        if is_valid:
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()
            
        return is_valid, feedback
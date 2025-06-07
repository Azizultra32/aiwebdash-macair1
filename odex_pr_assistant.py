#!/usr/bin/env python3
"""
Codex Environment PR Assistant
Designed to run directly in Codex desktop/web environments with HTTP access enabled.

Required Environment Variables:
- OPENAI_API_KEY: Your OpenAI API key (sk-...)
- GITHUB_PERSONAL_ACCESS_TOKEN or GITHUB_TOKEN: GitHub personal access token (ghp_...)

Optional Environment Variables:
- CODEX_MODEL: AI model to use (default: gpt-4o)
  Available options: gpt-4o, gpt-4-turbo
"""

import requests
import json
import os
import sys
import time
from datetime import datetime
from typing import List, Dict

# Configuration
REPO = "Azizultra32/AliGGGG"  # Your actual repository
FILTER_LABEL = "needs-review"  # Set to None to review all PRs
MAX_PRS_TO_PROCESS = 5  # Limit to avoid rate limits


def get_codex_model():
    """Get the AI model to use for reviews with intelligent fallback."""
    model = os.getenv("CODEX_MODEL", "gpt-4o")  # Default to GPT-4 Omni
    valid_models = [
        "gpt-4o",
        "gpt-4-turbo",
        "gpt-4",
        "gpt-4-0613",
        "gpt-3.5-turbo",
    ]
    if model not in valid_models:
        print(f"⚠️ Unknown model '{model}', falling back to 'gpt-4o'")
        model = "gpt-4o"
    return model


def get_model_config():
    """Get model-specific configuration parameters."""
    model = get_codex_model()
    config = {
        "gpt-4o": {"max_tokens": 1200, "temperature": 0.2},
        "gpt-4-turbo": {"max_tokens": 1200, "temperature": 0.2},
        "gpt-4": {"max_tokens": 1000, "temperature": 0.2},
        "gpt-4-0613": {"max_tokens": 1000, "temperature": 0.2},
        "gpt-3.5-turbo": {"max_tokens": 800, "temperature": 0.3},
    }
    return model, config.get(model, {"max_tokens": 1000, "temperature": 0.2})

# API endpoints
GITHUB_API_BASE = "https://api.github.com"
OPENAI_API_BASE = "https://api.openai.com/v1"


def check_environment() -> bool:
    """Verify required environment variables and API access."""
    print("🔍 Checking Codex environment setup...")
    openai_key = os.getenv("OPENAI_API_KEY")
    github_token = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN") or os.getenv("GITHUB_TOKEN")
    if not openai_key:
        print("❌ OPENAI_API_KEY not found in environment")
        return False
    if not github_token:
        print("❌ GITHUB_PERSONAL_ACCESS_TOKEN not found in environment")
        return False
    print("✅ Environment variables configured")
    print(f"✅ OpenAI key: {openai_key[:12]}...{openai_key[-4:]}")
    print(f"✅ GitHub token: {github_token[:8]}...{github_token[-4:]}")
    print(f"✅ Target repository: {REPO}")
    return True


def test_api_access() -> bool:
    """Test API connectivity from Codex environment with model validation."""
    print("\n🌐 Testing API connectivity and model access...")
    try:
        github_token = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN") or os.getenv("GITHUB_TOKEN")
        headers = {"Authorization": f"token {github_token}", "Accept": "application/vnd.github.v3+json"}
        response = requests.get(f"{GITHUB_API_BASE}/user", headers=headers, timeout=10)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ GitHub API: Connected as @{user_data.get('login', 'Unknown')}")
        else:
            print(f"❌ GitHub API: {response.status_code} - {response.text[:100]}")
            return False
        repo_response = requests.get(f"{GITHUB_API_BASE}/repos/{REPO}", headers=headers, timeout=10)
        if repo_response.status_code == 200:
            repo_data = repo_response.json()
            print(f"✅ Repository access: {repo_data.get('full_name')} ({repo_data.get('private', 'public')})")
        else:
            print(f"⚠️ Repository access: {repo_response.status_code} - Check REPO setting")
    except Exception as exc:
        print(f"❌ GitHub API connection failed: {exc}")
        return False
    try:
        openai_key = os.getenv("OPENAI_API_KEY")
        model, _ = get_model_config()
        headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
        test_payload = {
            "model": model,
            "messages": [{"role": "user", "content": "Test connection"}],
            "max_tokens": 5,
        }
        response = requests.post(f"{OPENAI_API_BASE}/chat/completions", headers=headers, json=test_payload, timeout=15)
        if response.status_code == 200:
            print(f"✅ OpenAI API: Connected successfully using {model}")
        else:
            print(f"❌ OpenAI API: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as exc:
        print(f"❌ OpenAI API connection failed: {exc}")
        return False
    print("🚀 All systems ready for PR processing!")
    return True


def fetch_open_prs() -> List[Dict]:
    """Fetch open pull requests from the repository."""
    print(f"\n📥 Fetching open PRs from {REPO}...")
    github_token = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN") or os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {github_token}", "Accept": "application/vnd.github.v3+json"}
    try:
        response = requests.get(f"{GITHUB_API_BASE}/repos/{REPO}/pulls", headers=headers)
        response.raise_for_status()
        prs = response.json()
        print(f"✅ Found {len(prs)} open PRs")
        if FILTER_LABEL:
            filtered_prs = []
            for pr in prs:
                labels = [label['name'] for label in pr.get('labels', [])]
                if FILTER_LABEL in labels:
                    filtered_prs.append(pr)
                else:
                    print(f"⏭️ Skipping PR #{pr['number']} ('{pr['title']}') - missing label '{FILTER_LABEL}'")
            prs = filtered_prs
            print(f"🏷️ After filtering by '{FILTER_LABEL}': {len(prs)} PRs")
        return prs[:MAX_PRS_TO_PROCESS]
    except requests.exceptions.RequestException as exc:
        print(f"❌ Error fetching PRs: {exc}")
        return []


def get_pr_diff(pr_number: int) -> str:
    """Fetch the diff for a specific PR."""
    github_token = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN") or os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {github_token}", "Accept": "application/vnd.github.v3.diff"}
    try:
        response = requests.get(f"{GITHUB_API_BASE}/repos/{REPO}/pulls/{pr_number}", headers=headers)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as exc:
        print(f"❌ Error fetching diff for PR #{pr_number}: {exc}")
        return ""


def analyze_with_codex(pr_number: int, pr_title: str, diff: str) -> str:
    """Send PR diff to Codex for analysis and review."""
    model, model_config = get_model_config()
    print(f"🧠 Analyzing PR #{pr_number} with {model}...")
    openai_key = os.getenv("OPENAI_API_KEY")
    headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
    prompt = (
        f"You are a senior software engineer conducting a thorough GitHub code review."\
        f" Analyze this pull request systematically and provide a structured review.\n\n"
        f"PR #{pr_number}: {pr_title}\n\nDIFF:\n{diff}\n\n"
        "Please provide a comprehensive review with these specific sections:"\
        "\n\n## 📝 Summary of Changes"\
        "\n- Brief overview of what this PR does"\
        "\n- Files modified and their purpose"\
        "\n\n## ⚠️ Potential Issues & Conflicts"\
        "\n- Any merge conflicts or integration concerns"\
        "\n- Breaking changes or backward compatibility issues"\
        "\n- Security or performance implications"\
        "\n\n## 💡 Suggestions for Improvements"\
        "\n- Code quality recommendations"\
        "\n- Best practices violations to address"\
        "\n- Optimization opportunities"\
        "\n\n## 🚦 Merge Readiness Assessment"\
        "\n- Is this PR safe to merge? (Yes/No/Conditional)"\
        "\n- Required actions before merge"\
        "\n- Testing recommendations"\
    )
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a senior software engineer with expertise in code review, conflict resolution, and software architecture. Provide thorough, actionable feedback.",
            },
            {"role": "user", "content": prompt},
        ],
        **model_config,
    }
    try:
        response = requests.post(f"{OPENAI_API_BASE}/chat/completions", headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        review = result['choices'][0]['message']['content']
        review += "\n\n---\n🧠 _This review was generated by Codex AI. Please verify suggestions before merging._"
        return review
    except requests.exceptions.RequestException as exc:
        print(f"❌ Error getting Codex review: {exc}")
        return f"❌ Failed to generate review: {exc}"


def post_review_comment(pr_number: int, review: str) -> bool:
    """Post the Codex review as a comment on the PR."""
    print(f"📝 Posting review comment to PR #{pr_number}...")
    github_token = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN") or os.getenv("GITHUB_TOKEN")
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    }
    comment_body = f"## 🤖 Codex AI Review\n\n{review}"
    payload = {"body": comment_body}
    try:
        response = requests.post(
            f"{GITHUB_API_BASE}/repos/{REPO}/issues/{pr_number}/comments",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        print(f"✅ Review posted successfully to PR #{pr_number}")
        return True
    except requests.exceptions.RequestException as exc:
        print(f"❌ Error posting comment to PR #{pr_number}: {exc}")
        return False


def log_review(pr_number: int, pr_title: str, review: str) -> None:
    """Log review details for auditing."""
    timestamp = datetime.utcnow().isoformat() + "Z"
    print(f"\n{'='*80}")
    print(f"## 📋 Review Summary for PR #{pr_number}")
    print(f"**Title:** {pr_title}")
    print(f"**Timestamp:** {timestamp}")
    print(f"{'='*80}")
    print(review)
    print(f"{'='*80}")
    review_data = {
        "pr_number": pr_number,
        "title": pr_title,
        "timestamp": timestamp,
        "review_length_chars": len(review),
        "review_length_words": len(review.split()),
        "status": "completed",
        "repo": REPO,
    }
    print("\n```json")
    print(json.dumps(review_data, indent=2))
    print("```")
    try:
        audit_entry = f"\n---\n### PR #{pr_number}: {pr_title}\n🕒 {timestamp}\n📊 Repository: {REPO}\n\n{review}\n\n"
        with open("codex_review_audit.md", "a", encoding="utf-8") as file:
            file.write(audit_entry)
        print("📝 Also logged to codex_review_audit.md")
    except Exception:
        print("📝 Web environment - audit saved to output above")


def main() -> None:
    """Main execution function."""
    print("🚀 Codex PR Assistant - Enhanced Edition")
    print("=" * 60)
    print("\n📋 STEP 1: Environment Validation")
    if not check_environment():
        print("\n❌ Environment setup incomplete. Please configure your API keys.")
        return
    print("\n📋 STEP 2: API Connectivity Test")
    if not test_api_access():
        print("\n❌ API connectivity failed. Check your tokens and network access.")
        return
    print(f"\n📋 STEP 3: PR Discovery and Filtering")
    open_prs = fetch_open_prs()
    if not open_prs:
        print("✅ No PRs found matching criteria.")
        if FILTER_LABEL:
            print(f"💡 PRs must be labeled '{FILTER_LABEL}' to be processed")
        return
    print(f"🎯 Found {len(open_prs)} PRs to process")
    print(f"\n📋 STEP 4: PR Review Processing")
    successful_reviews = 0
    failed_reviews = 0
    for i, pr in enumerate(open_prs, 1):
        pr_number = pr['number']
        pr_title = pr['title']
        print(f"\n🔄 [{i}/{len(open_prs)}] Processing PR #{pr_number}")
        print(f"📝 Title: {pr_title}")
        try:
            print("   📥 Fetching diff...")
            diff = get_pr_diff(pr_number)
            if not diff.strip():
                print("   ⚠️ Empty diff - skipping")
                continue
            print("   🧠 Analyzing with Codex...")
            review = analyze_with_codex(pr_number, pr_title, diff)
            print("   📤 Posting review comment...")
            success = post_review_comment(pr_number, review)
            if success:
                log_review(pr_number, pr_title, review)
                print("   ✅ Review completed successfully")
                successful_reviews += 1
            else:
                print("   ⚠️ Partial completion - review generated but not posted")
                failed_reviews += 1
        except Exception as exc:
            print(f"   ❌ Error: {exc}")
            failed_reviews += 1
        if i < len(open_prs):
            print("   ⏳ Rate limiting pause...")
            time.sleep(2)
    print(f"\n📋 STEP 5: Completion Summary")
    print("=" * 60)
    print("🎉 Codex PR Assistant completed!")
    print("📊 Results:")
    print(f"   ✅ Successful reviews: {successful_reviews}")
    print(f"   ❌ Failed reviews: {failed_reviews}")
    print(f"   📝 Total processed: {successful_reviews + failed_reviews}")
    print(f"   🎯 Repository: {REPO}")
    print("=" * 60)
    if successful_reviews > 0:
        print("💡 Check the GitHub PRs for posted reviews!")
    if failed_reviews > 0:
        print("⚠️ Some reviews failed - check error messages above")


if __name__ == "__main__":
    print("🔧 Codex PR Assistant - Pre-flight Check")
    print("-" * 50)
    if REPO == "YOUR_USERNAME/YOUR_REPO_NAME":
        print("❌ CONFIGURATION REQUIRED:\n   Please update the REPO variable with your actual repository")
        sys.exit(1)
    if not REPO or "/" not in REPO:
        print("❌ INVALID REPO FORMAT:\n   REPO must be in format 'username/repository'")
        sys.exit(1)
    print(f"✅ Repository configured: {REPO}")
    model, model_config = get_model_config()
    print(f"✅ AI Model: {model}")
    print(f"✅ Model Config: {model_config}")
    if os.getenv("CODEX_MODEL"):
        print("✅ Custom model from CODEX_MODEL environment variable")
    else:
        print("💡 Tip: Set CODEX_MODEL environment variable to use different model")
    if FILTER_LABEL:
        print(f"✅ PR filter: Only processing PRs labeled '{FILTER_LABEL}'")
    else:
        print("✅ PR filter: Processing ALL open PRs")
    print("-" * 50)
    main()

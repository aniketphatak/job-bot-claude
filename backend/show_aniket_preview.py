#!/usr/bin/env python3
"""
Final Demo - What Aniket Will See in JobBot
==========================================
"""

import requests
import json

BASE_URL = "http://localhost:8001/api"
USER_ID = "7db1f025-21f6-4737-a7a0-0c92c0581d71"

def show_dashboard_preview():
    """Show what Aniket will see on his dashboard"""
    print("🎯 ANIKET'S JOBBOT DASHBOARD PREVIEW")
    print("=" * 50)
    
    # Get profile info
    response = requests.get(f"{BASE_URL}/users/{USER_ID}")
    profile = response.json()
    
    print(f"👤 Welcome back, {profile['personal_info']['full_name']}!")
    print(f"📧 {profile['personal_info']['email']}")
    print(f"📍 {profile['personal_info']['location']}")
    print(f"💼 Current: Product Lead at Amazon")
    print(f"🎯 Skills: {len(profile['skills'])} professional skills")
    print()
    
    # Get campaigns
    response = requests.get(f"{BASE_URL}/users/{USER_ID}/campaigns")
    campaigns = response.json()
    
    print("🎯 ACTIVE CAMPAIGNS:")
    for campaign in campaigns:
        print(f"✅ {campaign['name']}")
        print(f"   📊 Status: {campaign['status'].upper()}")
        print(f"   🎯 Keywords: {len(campaign['keywords'])} targeted terms")
        print(f"   🏢 Companies: {len(campaign['companies'])} target companies")
        print(f"   💰 Salary: {campaign['salary_range']}")
        print()
    
    # Show sample matching jobs (excluding Amazon/Audible)
    print("🔥 HOT JOBS MATCHING YOUR PROFILE:")
    sample_jobs = [
        {
            "title": "Senior Product Manager - Voice AI",
            "company": "Google",
            "location": "Mountain View, CA",
            "salary": "$220k - $280k",
            "match_score": 95,
            "urgency": "critical",
            "time_left": "2h 15m",
            "why_match": "Voice AI expertise + 10+ years PM experience + B2C product background"
        },
        {
            "title": "Principal Product Manager - Automotive AI",
            "company": "Tesla",
            "location": "Palo Alto, CA",
            "salary": "$250k - $320k",
            "match_score": 92,
            "urgency": "high",
            "time_left": "1h 45m",
            "why_match": "Automotive product experience + AI/ML background + Scale expertise"
        },
        {
            "title": "Director of Product - Generative AI",
            "company": "OpenAI",
            "location": "San Francisco, CA",
            "salary": "$300k - $400k",
            "match_score": 89,
            "urgency": "medium",
            "time_left": "2h 50m",
            "why_match": "AI product leadership + Growth track record + Technical PM skills"
        }
    ]
    
    for i, job in enumerate(sample_jobs, 1):
        urgency_icon = "🔴" if job["urgency"] == "critical" else "🟠" if job["urgency"] == "high" else "🟡"
        print(f"{urgency_icon} JOB {i}: {job['title']}")
        print(f"   🏢 {job['company']} • {job['location']}")
        print(f"   💰 {job['salary']}")
        print(f"   🎯 {job['match_score']}% match • ⏰ {job['time_left']} left")
        print(f"   💡 Why you're perfect: {job['why_match']}")
        print()
    
    print("🚀 READY TO APPLY WITH AI-GENERATED CONTENT:")
    print("   ✅ Personalized cover letters highlighting your Voice AI expertise")
    print("   ✅ Tailored resume summaries emphasizing automotive product experience")
    print("   ✅ LinkedIn messages referencing your 10+ years at Amazon/Audible")
    print("   ✅ All applications automatically exclude Amazon/Audible as requested")
    print()
    
    print("📊 YOUR SUCCESS METRICS (will update as you apply):")
    print("   📈 Applications Submitted: 0 (ready to start!)")
    print("   📬 Response Rate: TBD (industry avg: 12-15%)")
    print("   📅 Interview Rate: TBD (your experience suggests 20%+)")
    print("   ⚡ Time to Response: TBD (3-hour window strategy)")
    print()
    
    print("🎯 NEXT STEPS:")
    print("   1. 🌐 Access your dashboard: http://localhost:3000")
    print("   2. 👤 Review your profile (already loaded with your resume)")
    print("   3. 🎯 Check your campaign (Senior Product Leadership - AI/Tech)")
    print("   4. 🔍 Browse hot jobs (auto-refreshed every 30 seconds)")
    print("   5. 🤖 Test AI features on relevant positions")
    print("   6. 🚀 Start applying with the 3-hour advantage!")

def show_ai_sample():
    """Show sample AI-generated content for Aniket"""
    print("\n" + "=" * 50)
    print("🤖 SAMPLE AI-GENERATED CONTENT FOR ANIKET")
    print("=" * 50)
    
    print("📝 SAMPLE COVER LETTER (for Google Voice AI PM role):")
    print("─" * 40)
    cover_letter_sample = """Dear Google Hiring Team,

As a Product Lead with 10+ years of experience pioneering Voice AI and Automotive technology, I am excited to apply for the Senior Product Manager - Voice AI position. My track record of scaling Amazon's Audio on Auto to 315K MAUs (+60% YoY) and delivering 10.3M dialogs in 2024 directly aligns with Google's mission to make AI helpful for everyone.

At Amazon, I led audio product strategy for 300,000+ vehicles across 30+ auto brands, giving me unique insight into consumer voice interaction patterns. My recent launch of the 'Media Resume' feature increased listening minutes by 17%, demonstrating my ability to identify user pain points and deliver impactful solutions.

I'm particularly drawn to Google's approach to conversational AI and would love to bring my automotive AI expertise to advance your voice technology initiatives.

Best regards,
Aniket Phatak"""
    
    print(cover_letter_sample)
    
    print("\n📄 SAMPLE RESUME SUMMARY (for Tesla Automotive AI PM role):")
    print("─" * 40)
    resume_summary = """Product Leader with 10+ years driving Voice AI and Automotive innovation at Amazon. Scaled Audio on Auto to 315K MAUs across 300,000+ vehicles spanning 30+ auto brands. Proven track record of 60% YoY growth and $2.3M incremental revenue through data-driven product optimization. Expert in B2B/B2C product strategy, cross-functional team leadership, and emerging AI technologies."""
    
    print(resume_summary)
    
    print("\n💼 SAMPLE LINKEDIN MESSAGE (for OpenAI Director role):")
    print("─" * 40)
    linkedin_message = """Hi [Name], I just applied for the Director of Product - Generative AI role at OpenAI. My experience scaling voice AI products at Amazon to 315K MAUs and pioneering automotive AI integrations aligns well with OpenAI's mission. I'd love to connect and share insights about product leadership in the AI space."""
    
    print(linkedin_message)

if __name__ == "__main__":
    show_dashboard_preview()
    show_ai_sample()
    
    print("\n" + "🎉" * 20)
    print("JOBBOT IS READY FOR ANIKET PHATAK!")
    print("🎉" * 20)
    print("\n🌐 Access your personalized job search assistant at:")
    print("   http://localhost:3000")
    print("\n🚀 Your competitive advantage in the job market starts now!")
namespace Backend.Models;

public static class ReferenceData {
    public static readonly string[] Cities = [
        "Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current",
        "Yorkton", "North Battleford", "Estevan", "Weyburn", "Lloydminster",
        "Humboldt", "Melfort", "Melville", "Kindersley", "Tisdale", "Other",
    ];

    public static readonly string[] HelpTypes = [
        "Senior Care Support", "Meal Assistance", "Transportation Support", "Medical Assistance",
        "Mental Health Support", "Housing Support", "Other",
    ];

    public static readonly string[] OrganizationCategories = [
        "Seniors and Healthy Aging", "Health Care and Wellness", "Mental Health and Wellbeing",
        "Disability Services and Accessibility", "Children and Youth", "Education and Literacy",
        "Employment and Career Development", "Indigenous Communities and Reconciliation",
        "Newcomer and Immigrant Support", "Poverty Reduction", "Food Security", "Housing and Homelessness",
        "Social Isolation and Community Connection", "Family and Caregiver Support", "Arts, Culture and Heritage",
        "Sports and Recreation", "Environment and Sustainability", "Animal Welfare",
        "Emergency Response and Disaster Relief", "Human Rights and Social Justice", "Community Safety",
        "Research and Innovation", "Other",
    ];

    public static readonly string[] OrganizationTypes = [
        "Registered Charity", "Incorporated Non-Profit Organization", "Community-Based Organization",
        "Indigenous-Led Organization", "Grassroots or Volunteer-Led Initiative", "Faith-Based Organization",
        "Educational Institution", "Social Enterprise", "Public Institution or Agency",
        "Business with a Community Volunteer Program", "Other",
    ];

    public static readonly string[] GeographicScopes = [
        "Local Community", "Municipal/Regional", "Saskatchewan-Wide", "Western Canada", "National", "International",
    ];

    public static readonly string[] PopulationsServed = [
        "Children", "Youth", "Young Adults", "Adults", "Seniors", "Families", "Care Partners/Caregivers",
        "Individuals Living with Disabilities", "Indigenous Peoples and Communities", "Newcomers and Refugees",
        "Individuals Experiencing Financial Hardship", "Rural or Remote Communities", "General Public", "Other",
    ];

    public static readonly string[] ServiceLanguages = ["French", "Cree", "Dene", "Michif", "Tagalog", "Other"];

    public static readonly string[] UpdateContacts = [
        "Person submitting this form", "Volunteer Coordinator", "Communications Representative", "Other",
    ];

    public static readonly string[] ReviewFrequencies = ["Every 3 Months", "Every 6 Months", "Annually", "Only When Changes Occur"];

    public static readonly string[] EngagementInterests = [
        "Volunteer Recruitment Events", "Community Collaboration Opportunities", "Non-Profit Networking",
        "Training and Education", "Funding or Grant Opportunities", "None at This Time",
    ];

    public static readonly string[] ResourceAudiences = ["Organizations", "Volunteers"];

    public static readonly string[] ResourceTopics = ["Onboarding", "Screening", "Recognition", "Feedback", "Inclusivity"];

    public static readonly string[] FaqTopics = ["GettingStarted", "BackgroundChecks", "Insurance", "Training"];

    public static readonly string[] TestimonialRoles = ["Volunteer", "Organization", "Family"];

    public static readonly string[] Days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    public static readonly string[] TimesOfDay = ["Morning", "Afternoon", "Evening"];

    public static readonly string[] Languages = ["English", "French", "Spanish", "Other"];
}

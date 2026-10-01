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
        "Health", "Seniors Services", "Youth", "Education", "Environment",
        "Arts and Culture", "Community Services", "Other",
    ];

    public static readonly string[] ResourceAudiences = ["Organizations", "Volunteers"];

    public static readonly string[] ResourceTopics = ["Onboarding", "Screening", "Recognition", "Feedback", "Inclusivity"];

    public static readonly string[] Days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    public static readonly string[] TimesOfDay = ["Morning", "Afternoon", "Evening"];

    public static readonly string[] Languages = ["English", "French", "Spanish", "Other"];
}

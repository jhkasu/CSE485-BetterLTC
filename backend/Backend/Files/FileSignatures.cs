namespace Backend.Files;

public static class FileSignatures {
    public const string Pdf = "application/pdf";
    public const string Png = "image/png";
    public const string Jpeg = "image/jpeg";
    public const string Docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    public static bool Matches(byte[] data, string contentType) {
        return contentType switch {
            Pdf => StartsWith(data, [0x25, 0x50, 0x44, 0x46]),
            Png => StartsWith(data, [0x89, 0x50, 0x4E, 0x47]),
            Jpeg => StartsWith(data, [0xFF, 0xD8, 0xFF]),
            Docx => StartsWith(data, [0x50, 0x4B, 0x03, 0x04]),
            _ => false,
        };
    }

    private static bool StartsWith(byte[] data, byte[] prefix) {
        return data.Length >= prefix.Length && data.AsSpan(0, prefix.Length).SequenceEqual(prefix);
    }
}

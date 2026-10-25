namespace Backend.Security;

public class SiteOrigins {
    private readonly string[] _origins;

    public SiteOrigins(IEnumerable<string> origins) {
        _origins = origins.Select(o => o.Trim().TrimEnd('/')).Where(o => o.Length > 0).ToArray();
    }

    public string? For(HttpRequest request) {
        string origin = request.Headers.Origin.ToString().Trim().TrimEnd('/');
        if (_origins.Contains(origin, StringComparer.OrdinalIgnoreCase)) return origin;
        return _origins.FirstOrDefault();
    }
}

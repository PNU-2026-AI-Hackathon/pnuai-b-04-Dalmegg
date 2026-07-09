using UnityEngine;

public class EnvironmentController : MonoBehaviour
{
    [Header("Environment Values")]
    [Range(0f, 50f)] public float temperature = 24f;
    [Range(0f, 100f)] public float humidity = 60f;
    [Range(0f, 100f)] public float light = 70f;
    [Range(0f, 100f)] public float soilMoisture = 50f;

    [Header("References")]
    [SerializeField] private GrowthSimulator growthSimulator;

    public float Temperature => temperature;
    public float Humidity => humidity;
    public float Light => light;
    public float SoilMoisture => soilMoisture;

    private void Awake()
    {
        ClampEnvironmentValues();
    }

    private void Start()
    {
        ResolveGrowthSimulator();
        RequestGrowthRecalculation();
    }

    private void OnValidate()
    {
        ClampEnvironmentValues();

        if (Application.isPlaying)
        {
            RequestGrowthRecalculation();
        }
    }

    public void SetGrowthSimulator(GrowthSimulator simulator)
    {
        growthSimulator = simulator;
    }

    public void SetEnvironment(float temperature, float humidity, float light, float soilMoisture)
    {
        float nextTemperature = Mathf.Clamp(temperature, 0f, 50f);
        float nextHumidity = Mathf.Clamp(humidity, 0f, 100f);
        float nextLight = Mathf.Clamp(light, 0f, 100f);
        float nextSoilMoisture = Mathf.Clamp(soilMoisture, 0f, 100f);

        bool changed =
            !Mathf.Approximately(this.temperature, nextTemperature) ||
            !Mathf.Approximately(this.humidity, nextHumidity) ||
            !Mathf.Approximately(this.light, nextLight) ||
            !Mathf.Approximately(this.soilMoisture, nextSoilMoisture);

        this.temperature = nextTemperature;
        this.humidity = nextHumidity;
        this.light = nextLight;
        this.soilMoisture = nextSoilMoisture;

        if (changed)
        {
            RequestGrowthRecalculation();
        }
    }

    public void RequestGrowthRecalculation()
    {
        ResolveGrowthSimulator();

        if (growthSimulator != null)
        {
            growthSimulator.RecalculateGrowth(this);
        }
    }

    private void ResolveGrowthSimulator()
    {
        if (growthSimulator == null && GameManager.Instance != null)
        {
            growthSimulator = GameManager.Instance.GrowthSimulator;
        }

        if (growthSimulator == null)
        {
            growthSimulator = Object.FindFirstObjectByType<GrowthSimulator>();
        }
    }

    private void ClampEnvironmentValues()
    {
        temperature = Mathf.Clamp(temperature, 0f, 50f);
        humidity = Mathf.Clamp(humidity, 0f, 100f);
        light = Mathf.Clamp(light, 0f, 100f);
        soilMoisture = Mathf.Clamp(soilMoisture, 0f, 100f);
    }
}

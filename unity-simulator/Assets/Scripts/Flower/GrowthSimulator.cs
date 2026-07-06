using UnityEngine;

public enum GrowthStage
{
    Withered,
    Seed,
    Growing,
    Bloom
}

public struct GrowthSimulationResult
{
    public float growthScore;
    public GrowthStage growthStage;
    public string statusMessage;

    public GrowthSimulationResult(float growthScore, GrowthStage growthStage, string statusMessage)
    {
        this.growthScore = growthScore;
        this.growthStage = growthStage;
        this.statusMessage = statusMessage;
    }
}

public class GrowthSimulator : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private FlowerController flowerController;

    [Header("Simulation Result")]
    [SerializeField, Range(0f, 100f)] private float growthScore;
    [SerializeField] private GrowthStage currentStage = GrowthStage.Seed;
    [SerializeField] private string statusMessage = "건강함";

    public float GrowthScore => growthScore;
    public GrowthStage CurrentStage => currentStage;
    public string StatusMessage => statusMessage;

    private void Start()
    {
        ResolveFlowerController();

        if (GameManager.Instance != null && GameManager.Instance.EnvironmentController != null)
        {
            RecalculateGrowth(GameManager.Instance.EnvironmentController);
        }
    }

    public void SetFlowerController(FlowerController controller)
    {
        flowerController = controller;
    }

    public GrowthSimulationResult RecalculateGrowth(EnvironmentController environmentController)
    {
        if (environmentController == null)
        {
            GrowthSimulationResult currentResult = new GrowthSimulationResult(growthScore, currentStage, statusMessage);
            return currentResult;
        }

        return RecalculateGrowth(
            environmentController.Temperature,
            environmentController.Humidity,
            environmentController.Light,
            environmentController.SoilMoisture
        );
    }

    public GrowthSimulationResult RecalculateGrowth(float temperature, float humidity, float light, float soilMoisture)
    {
        float temperatureScore = CalculateRangeScore(temperature, 18f, 26f);
        float humidityScore = CalculateRangeScore(humidity, 50f, 70f);
        float lightScore = CalculateRangeScore(light, 60f, 85f);
        float soilMoistureScore = CalculateRangeScore(soilMoisture, 45f, 70f);

        growthScore = Mathf.Clamp(
            temperatureScore + humidityScore + lightScore + soilMoistureScore,
            0f,
            100f
        );

        currentStage = CalculateGrowthStage(growthScore);
        statusMessage = CalculateStatusMessage(temperature, humidity, light, soilMoisture);

        ResolveFlowerController();

        if (flowerController != null)
        {
            flowerController.ApplyGrowth(growthScore, currentStage);
        }

        return new GrowthSimulationResult(growthScore, currentStage, statusMessage);
    }

    private float CalculateRangeScore(float value, float optimalMin, float optimalMax)
    {
        if (value >= optimalMin && value <= optimalMax)
        {
            return 25f;
        }

        float difference = value < optimalMin ? optimalMin - value : value - optimalMax;
        return Mathf.Clamp(25f - difference, 0f, 25f);
    }

    private GrowthStage CalculateGrowthStage(float score)
    {
        if (score < 25f)
        {
            return GrowthStage.Withered;
        }

        if (score < 50f)
        {
            return GrowthStage.Seed;
        }

        if (score < 75f)
        {
            return GrowthStage.Growing;
        }

        return GrowthStage.Bloom;
    }

    private string CalculateStatusMessage(float temperature, float humidity, float light, float soilMoisture)
    {
        if (temperature > 26f)
        {
            return "고온";
        }

        if (temperature < 18f)
        {
            return "저온";
        }

        if (humidity > 70f || soilMoisture > 70f)
        {
            return "과습";
        }

        if (humidity < 50f || soilMoisture < 45f)
        {
            return "건조";
        }

        if (light < 60f)
        {
            return "광량 부족";
        }

        if (light > 85f)
        {
            return "광량 과다";
        }

        return "건강함";
    }

    private void ResolveFlowerController()
    {
        if (flowerController == null && GameManager.Instance != null)
        {
            flowerController = GameManager.Instance.FlowerController;
        }

        if (flowerController == null)
        {
            flowerController = Object.FindFirstObjectByType<FlowerController>();
        }
    }
}

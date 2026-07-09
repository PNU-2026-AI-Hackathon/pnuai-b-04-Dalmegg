using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    [Header("Scene References")]
    [SerializeField] private EnvironmentController environmentController;
    [SerializeField] private GrowthSimulator growthSimulator;

    [Header("Environment Sliders")]
    [SerializeField] private Slider temperatureSlider;
    [SerializeField] private Slider humiditySlider;
    [SerializeField] private Slider lightSlider;
    [SerializeField] private Slider soilMoistureSlider;

    [Header("Value Labels")]
    [SerializeField] private TMP_Text temperatureValueText;
    [SerializeField] private TMP_Text humidityValueText;
    [SerializeField] private TMP_Text lightValueText;
    [SerializeField] private TMP_Text soilMoistureValueText;

    [Header("Result Labels")]
    [SerializeField] private TMP_Text growthScoreText;
    [SerializeField] private TMP_Text growthStageText;
    [SerializeField] private TMP_Text statusMessageText;

    private const float DefaultTemperature = 24f;
    private const float DefaultHumidity = 60f;
    private const float DefaultLight = 70f;
    private const float DefaultSoilMoisture = 50f;

    private bool isInitializing;

    private void Awake()
    {
        ResolveSceneReferences();
        ResolveSlidersByName();
        ResolveTextsByName();
        ConfigureSliders();
    }

    private void OnEnable()
    {
        RegisterSliderEvents();
    }

    private void Start()
    {
        SyncFromEnvironment();
    }

    private void OnDisable()
    {
        UnregisterSliderEvents();
    }

    public void ApplySliderValues()
    {
        if (isInitializing)
        {
            return;
        }

        ResolveSceneReferences();

        float temperature = ReadSliderValue(temperatureSlider, DefaultTemperature);
        float humidity = ReadSliderValue(humiditySlider, DefaultHumidity);
        float light = ReadSliderValue(lightSlider, DefaultLight);
        float soilMoisture = ReadSliderValue(soilMoistureSlider, DefaultSoilMoisture);

        if (environmentController != null)
        {
            environmentController.SetEnvironment(temperature, humidity, light, soilMoisture);
            environmentController.RequestGrowthRecalculation();
        }

        UpdateValueLabels(temperature, humidity, light, soilMoisture);
        UpdateResultLabels();
    }

    public void ResetToDefaultValues()
    {
        isInitializing = true;

        SetSliderValueWithoutNotify(temperatureSlider, DefaultTemperature);
        SetSliderValueWithoutNotify(humiditySlider, DefaultHumidity);
        SetSliderValueWithoutNotify(lightSlider, DefaultLight);
        SetSliderValueWithoutNotify(soilMoistureSlider, DefaultSoilMoisture);

        isInitializing = false;
        ApplySliderValues();
    }

    public void SyncFromEnvironment()
    {
        isInitializing = true;

        ResolveSceneReferences();
        ResolveSlidersByName();
        ResolveTextsByName();

        float temperature = environmentController == null ? DefaultTemperature : environmentController.Temperature;
        float humidity = environmentController == null ? DefaultHumidity : environmentController.Humidity;
        float light = environmentController == null ? DefaultLight : environmentController.Light;
        float soilMoisture = environmentController == null ? DefaultSoilMoisture : environmentController.SoilMoisture;

        SetSliderValueWithoutNotify(temperatureSlider, temperature);
        SetSliderValueWithoutNotify(humiditySlider, humidity);
        SetSliderValueWithoutNotify(lightSlider, light);
        SetSliderValueWithoutNotify(soilMoistureSlider, soilMoisture);

        isInitializing = false;
        ApplySliderValues();
    }

    private void ResolveSceneReferences()
    {
        if (environmentController == null && GameManager.Instance != null)
        {
            environmentController = GameManager.Instance.EnvironmentController;
        }

        if (growthSimulator == null && GameManager.Instance != null)
        {
            growthSimulator = GameManager.Instance.GrowthSimulator;
        }

        if (environmentController == null)
        {
            environmentController = Object.FindFirstObjectByType<EnvironmentController>();
        }

        if (growthSimulator == null)
        {
            growthSimulator = Object.FindFirstObjectByType<GrowthSimulator>();
        }
    }

    private void ResolveSlidersByName()
    {
        if (temperatureSlider == null)
        {
            temperatureSlider = FindSlider("TemperatureSlider");
        }

        if (humiditySlider == null)
        {
            humiditySlider = FindSlider("HumiditySlider");
        }

        if (lightSlider == null)
        {
            lightSlider = FindSlider("LightSlider");
        }

        if (soilMoistureSlider == null)
        {
            soilMoistureSlider = FindSlider("SoilMoistureSlider");
        }
    }

    private Slider FindSlider(string objectName)
    {
        GameObject sliderObject = GameObject.Find(objectName);
        return sliderObject == null ? null : sliderObject.GetComponent<Slider>();
    }

    private void ResolveTextsByName()
    {
        if (temperatureValueText == null)
        {
            temperatureValueText = FindText("Temperature Value Text");
        }

        if (humidityValueText == null)
        {
            humidityValueText = FindText("Humidity Value Text");
        }

        if (lightValueText == null)
        {
            lightValueText = FindText("Light Value Text");
        }

        if (soilMoistureValueText == null)
        {
            soilMoistureValueText = FindText("Soil Moisture Value Text");
        }

        if (growthScoreText == null)
        {
            growthScoreText = FindText("Growth Score Text");
        }

        if (growthStageText == null)
        {
            growthStageText = FindText("Growth Stage Text");
        }

        if (statusMessageText == null)
        {
            statusMessageText = FindText("Status Message Text");
        }
    }

    private TMP_Text FindText(string objectName)
    {
        GameObject textObject = GameObject.Find(objectName);
        return textObject == null ? null : textObject.GetComponent<TMP_Text>();
    }

    private void ConfigureSliders()
    {
        ConfigureSlider(temperatureSlider, 0f, 50f);
        ConfigureSlider(humiditySlider, 0f, 100f);
        ConfigureSlider(lightSlider, 0f, 100f);
        ConfigureSlider(soilMoistureSlider, 0f, 100f);
    }

    private void ConfigureSlider(Slider slider, float minValue, float maxValue)
    {
        if (slider == null)
        {
            return;
        }

        slider.minValue = minValue;
        slider.maxValue = maxValue;
        slider.wholeNumbers = false;
    }

    private void InitializeSliderValues()
    {
        isInitializing = true;

        ResolveSceneReferences();

        float temperature = environmentController == null ? DefaultTemperature : environmentController.Temperature;
        float humidity = environmentController == null ? DefaultHumidity : environmentController.Humidity;
        float light = environmentController == null ? DefaultLight : environmentController.Light;
        float soilMoisture = environmentController == null ? DefaultSoilMoisture : environmentController.SoilMoisture;

        SetSliderValueWithoutNotify(temperatureSlider, temperature);
        SetSliderValueWithoutNotify(humiditySlider, humidity);
        SetSliderValueWithoutNotify(lightSlider, light);
        SetSliderValueWithoutNotify(soilMoistureSlider, soilMoisture);

        isInitializing = false;
    }

    private void RegisterSliderEvents()
    {
        AddSliderListener(temperatureSlider);
        AddSliderListener(humiditySlider);
        AddSliderListener(lightSlider);
        AddSliderListener(soilMoistureSlider);
    }

    private void UnregisterSliderEvents()
    {
        RemoveSliderListener(temperatureSlider);
        RemoveSliderListener(humiditySlider);
        RemoveSliderListener(lightSlider);
        RemoveSliderListener(soilMoistureSlider);
    }

    private void AddSliderListener(Slider slider)
    {
        if (slider != null)
        {
            slider.onValueChanged.AddListener(OnSliderValueChanged);
        }
    }

    private void RemoveSliderListener(Slider slider)
    {
        if (slider != null)
        {
            slider.onValueChanged.RemoveListener(OnSliderValueChanged);
        }
    }

    private void OnSliderValueChanged(float value)
    {
        ApplySliderValues();
    }

    private float ReadSliderValue(Slider slider, float fallback)
    {
        return slider == null ? fallback : slider.value;
    }

    private void SetSliderValueWithoutNotify(Slider slider, float value)
    {
        if (slider != null)
        {
            slider.SetValueWithoutNotify(Mathf.Clamp(value, slider.minValue, slider.maxValue));
        }
    }

    private void UpdateValueLabels(float temperature, float humidity, float light, float soilMoisture)
    {
        SetText(temperatureValueText, $"온도: {temperature:0.#}°C");
        SetText(humidityValueText, $"습도: {humidity:0.#}%");
        SetText(lightValueText, $"조도: {light:0.#}%");
        SetText(soilMoistureValueText, $"토양수분: {soilMoisture:0.#}%");
    }

    private void UpdateResultLabels()
    {
        ResolveSceneReferences();

        if (growthSimulator == null)
        {
            SetText(growthScoreText, "성장 점수: -");
            SetText(growthStageText, "성장 단계: -");
            SetText(statusMessageText, "상태: -");
            return;
        }

        SetText(growthScoreText, $"성장 점수: {growthSimulator.GrowthScore:0.#}");
        SetText(growthStageText, $"성장 단계: {GetGrowthStageLabel(growthSimulator.CurrentStage)}");
        SetText(statusMessageText, $"상태: {growthSimulator.StatusMessage}");
    }

    private string GetGrowthStageLabel(GrowthStage growthStage)
    {
        switch (growthStage)
        {
            case GrowthStage.Withered:
                return "시듦";
            case GrowthStage.Seed:
                return "씨앗";
            case GrowthStage.Growing:
                return "성장 중";
            case GrowthStage.Bloom:
                return "개화";
            default:
                return growthStage.ToString();
        }
    }

    private void SetText(TMP_Text text, string value)
    {
        if (text != null)
        {
            text.text = value;
        }
    }
}

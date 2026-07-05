using System;
using System.Globalization;
using UnityEngine;

public class WebBridge : MonoBehaviour
{
    [SerializeField] private EnvironmentController environmentController;
    [SerializeField] private UIManager uiManager;

    [Serializable]
    private struct EnvironmentPayload
    {
        public float temperature;
        public float humidity;
        public float light;
        public float soilMoisture;
    }

    private void Awake()
    {
        ResolveReferences();
    }

    public void SetEnvironmentJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return;
        }

        EnvironmentPayload payload = JsonUtility.FromJson<EnvironmentPayload>(json);
        ApplyEnvironment(payload.temperature, payload.humidity, payload.light, payload.soilMoisture);
    }

    public void SetEnvironmentCsv(string csv)
    {
        if (string.IsNullOrWhiteSpace(csv))
        {
            return;
        }

        string[] values = csv.Split(',');

        if (values.Length < 4)
        {
            return;
        }

        if (!TryParseFloat(values[0], out float temperature) ||
            !TryParseFloat(values[1], out float humidity) ||
            !TryParseFloat(values[2], out float light) ||
            !TryParseFloat(values[3], out float soilMoisture))
        {
            return;
        }

        ApplyEnvironment(temperature, humidity, light, soilMoisture);
    }

    public void SetTemperature(string value)
    {
        if (TryParseFloat(value, out float temperature))
        {
            ResolveReferences();
            ApplyEnvironment(
                temperature,
                environmentController == null ? 60f : environmentController.Humidity,
                environmentController == null ? 70f : environmentController.Light,
                environmentController == null ? 50f : environmentController.SoilMoisture
            );
        }
    }

    public void SetHumidity(string value)
    {
        if (TryParseFloat(value, out float humidity))
        {
            ResolveReferences();
            ApplyEnvironment(
                environmentController == null ? 24f : environmentController.Temperature,
                humidity,
                environmentController == null ? 70f : environmentController.Light,
                environmentController == null ? 50f : environmentController.SoilMoisture
            );
        }
    }

    public void SetLight(string value)
    {
        if (TryParseFloat(value, out float light))
        {
            ResolveReferences();
            ApplyEnvironment(
                environmentController == null ? 24f : environmentController.Temperature,
                environmentController == null ? 60f : environmentController.Humidity,
                light,
                environmentController == null ? 50f : environmentController.SoilMoisture
            );
        }
    }

    public void SetSoilMoisture(string value)
    {
        if (TryParseFloat(value, out float soilMoisture))
        {
            ResolveReferences();
            ApplyEnvironment(
                environmentController == null ? 24f : environmentController.Temperature,
                environmentController == null ? 60f : environmentController.Humidity,
                environmentController == null ? 70f : environmentController.Light,
                soilMoisture
            );
        }
    }

    private void ApplyEnvironment(float temperature, float humidity, float light, float soilMoisture)
    {
        ResolveReferences();

        if (environmentController == null)
        {
            return;
        }

        environmentController.SetEnvironment(temperature, humidity, light, soilMoisture);

        if (uiManager != null)
        {
            uiManager.SyncFromEnvironment();
        }
    }

    private void ResolveReferences()
    {
        if (environmentController == null && GameManager.Instance != null)
        {
            environmentController = GameManager.Instance.EnvironmentController;
        }

        if (environmentController == null)
        {
            environmentController = UnityEngine.Object.FindFirstObjectByType<EnvironmentController>();
        }

        if (uiManager == null)
        {
            uiManager = UnityEngine.Object.FindFirstObjectByType<UIManager>();
        }
    }

    private bool TryParseFloat(string value, out float result)
    {
        return float.TryParse(
            value,
            NumberStyles.Float,
            CultureInfo.InvariantCulture,
            out result
        );
    }
}

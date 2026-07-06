using UnityEngine;

public class SmartFarmDeviceBuilder : MonoBehaviour
{
    [Header("Device Layout")]
    [SerializeField] private Vector3 deviceCenter = Vector3.zero;
    [SerializeField] private bool buildOnStart;
    [SerializeField] private bool hideLegacyPotAndSoil = true;

    private Material baseMaterial;
    private Material trayMaterial;
    private Material lidMaterial;
    private Material waterMaterial;
    private Material metalMaterial;
    private Material lightMaterial;
    private Material screenMaterial;
    private Material greenStatusMaterial;
    private Material yellowStatusMaterial;

    private void Start()
    {
        if (buildOnStart && transform.childCount == 0)
        {
            BuildDevice();
        }
    }

    [ContextMenu("Build Smart Farm Device")]
    public void BuildDevice()
    {
        ClearDevice();
        CreateMaterials();

        if (hideLegacyPotAndSoil)
        {
            HideLegacyObject("Pot");
            HideLegacyObject("Soil");
        }

        CreateBaseModule();
        CreateCultivationTray();
        CreateGrowLightFrame();
        CreateSensorsAndControlPanel();
    }

    [ContextMenu("Clear Smart Farm Device")]
    public void ClearDevice()
    {
        for (int i = transform.childCount - 1; i >= 0; i--)
        {
            GameObject child = transform.GetChild(i).gameObject;

            if (Application.isPlaying)
            {
                Destroy(child);
            }
            else
            {
                DestroyImmediate(child);
            }
        }
    }

    private void CreateBaseModule()
    {
        CreateCube("DeviceBase", deviceCenter + new Vector3(0f, 0.07f, 0f), new Vector3(1.9f, 0.14f, 1.15f), baseMaterial);
        CreateCube("DeviceFrontPanel", deviceCenter + new Vector3(0f, 0.22f, -0.58f), new Vector3(1.75f, 0.26f, 0.06f), trayMaterial);
        CreateCube("DeviceBackPanel", deviceCenter + new Vector3(0f, 0.22f, 0.58f), new Vector3(1.75f, 0.26f, 0.06f), trayMaterial);
        CreateCube("DeviceLeftPanel", deviceCenter + new Vector3(-0.9f, 0.22f, 0f), new Vector3(0.06f, 0.26f, 1.15f), trayMaterial);
        CreateCube("DeviceRightPanel", deviceCenter + new Vector3(0.9f, 0.22f, 0f), new Vector3(0.06f, 0.26f, 1.15f), trayMaterial);
    }

    private void CreateCultivationTray()
    {
        CreateCube("NutrientWaterSurface", deviceCenter + new Vector3(0f, 0.32f, 0f), new Vector3(1.55f, 0.025f, 0.82f), waterMaterial);
        CreateCube("PlantingLid", deviceCenter + new Vector3(0f, 0.39f, 0f), new Vector3(1.65f, 0.06f, 0.92f), lidMaterial);
        CreateCylinder("PlantingCup", deviceCenter + new Vector3(0f, 0.45f, 0f), new Vector3(0.24f, 0.05f, 0.24f), lidMaterial);
        CreateCylinder("StemCollar", deviceCenter + new Vector3(0f, 0.5f, 0f), new Vector3(0.13f, 0.035f, 0.13f), trayMaterial);

        CreateCube("NutrientPipeLeft", deviceCenter + new Vector3(-0.62f, 0.49f, 0.46f), new Vector3(0.42f, 0.035f, 0.035f), metalMaterial);
        CreateCube("NutrientPipeRight", deviceCenter + new Vector3(0.62f, 0.49f, 0.46f), new Vector3(0.42f, 0.035f, 0.035f), metalMaterial);
        CreateCube("DrainLine", deviceCenter + new Vector3(0.74f, 0.26f, -0.64f), new Vector3(0.035f, 0.28f, 0.035f), metalMaterial);
    }

    private void CreateGrowLightFrame()
    {
        CreateCube("FrameLeftPost", deviceCenter + new Vector3(-0.78f, 1.25f, 0f), new Vector3(0.055f, 1.65f, 0.055f), metalMaterial);
        CreateCube("FrameRightPost", deviceCenter + new Vector3(0.78f, 1.25f, 0f), new Vector3(0.055f, 1.65f, 0.055f), metalMaterial);
        CreateCube("FrameTopRail", deviceCenter + new Vector3(0f, 2.08f, 0f), new Vector3(1.65f, 0.055f, 0.055f), metalMaterial);

        CreateCube("GrowLedBar", deviceCenter + new Vector3(0f, 1.9f, -0.08f), new Vector3(1.25f, 0.07f, 0.09f), lightMaterial);
        CreateCube("GrowLedGlow", deviceCenter + new Vector3(0f, 1.83f, -0.08f), new Vector3(1.1f, 0.025f, 0.08f), lightMaterial);
    }

    private void CreateSensorsAndControlPanel()
    {
        CreateCube("ControlPanelBody", deviceCenter + new Vector3(-0.58f, 0.38f, -0.65f), new Vector3(0.5f, 0.3f, 0.06f), metalMaterial);
        CreateCube("ControlPanelScreen", deviceCenter + new Vector3(-0.58f, 0.43f, -0.685f), new Vector3(0.32f, 0.12f, 0.015f), screenMaterial);
        CreateCylinder("StatusLedHealthy", deviceCenter + new Vector3(-0.38f, 0.28f, -0.69f), new Vector3(0.04f, 0.012f, 0.04f), greenStatusMaterial);
        CreateCylinder("StatusLedWarning", deviceCenter + new Vector3(-0.5f, 0.28f, -0.69f), new Vector3(0.04f, 0.012f, 0.04f), yellowStatusMaterial);

        CreateCube("SensorMast", deviceCenter + new Vector3(0.62f, 0.92f, -0.35f), new Vector3(0.04f, 0.9f, 0.04f), metalMaterial);
        CreateCube("SensorHead", deviceCenter + new Vector3(0.62f, 1.36f, -0.35f), new Vector3(0.22f, 0.16f, 0.14f), screenMaterial);
        CreateCube("SoilProbe", deviceCenter + new Vector3(0.18f, 0.58f, 0.1f), new Vector3(0.025f, 0.3f, 0.025f), metalMaterial);
    }

    private GameObject CreateCube(string objectName, Vector3 localPosition, Vector3 localScale, Material material)
    {
        GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cube.name = objectName;
        cube.transform.SetParent(transform);
        cube.transform.localPosition = localPosition;
        cube.transform.localRotation = Quaternion.identity;
        cube.transform.localScale = localScale;
        ApplyMaterial(cube, material);
        return cube;
    }

    private GameObject CreateCylinder(string objectName, Vector3 localPosition, Vector3 localScale, Material material)
    {
        GameObject cylinder = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        cylinder.name = objectName;
        cylinder.transform.SetParent(transform);
        cylinder.transform.localPosition = localPosition;
        cylinder.transform.localRotation = Quaternion.identity;
        cylinder.transform.localScale = localScale;
        ApplyMaterial(cylinder, material);
        return cylinder;
    }

    private void ApplyMaterial(GameObject target, Material material)
    {
        Renderer renderer = target.GetComponent<Renderer>();

        if (renderer != null && material != null)
        {
            renderer.sharedMaterial = material;
        }
    }

    private void HideLegacyObject(string objectName)
    {
        GameObject legacyObject = GameObject.Find(objectName);

        if (legacyObject != null)
        {
            legacyObject.SetActive(false);
        }
    }

    private void CreateMaterials()
    {
        baseMaterial = CreateMaterial("Smart Farm Base", new Color(0.12f, 0.16f, 0.18f));
        trayMaterial = CreateMaterial("Recycled Tray Body", new Color(0.18f, 0.32f, 0.34f));
        lidMaterial = CreateMaterial("Cultivation Lid", new Color(0.86f, 0.9f, 0.84f));
        waterMaterial = CreateMaterial("Nutrient Solution", new Color(0.16f, 0.58f, 0.68f));
        metalMaterial = CreateMaterial("Device Metal", new Color(0.38f, 0.43f, 0.42f));
        lightMaterial = CreateMaterial("LED Grow Light", new Color(0.72f, 1f, 0.86f));
        screenMaterial = CreateMaterial("Sensor Screen", new Color(0.05f, 0.15f, 0.16f));
        greenStatusMaterial = CreateMaterial("Healthy LED", new Color(0.2f, 1f, 0.42f));
        yellowStatusMaterial = CreateMaterial("Warning LED", new Color(1f, 0.8f, 0.18f));
    }

    private Material CreateMaterial(string materialName, Color color)
    {
        Shader shader = Shader.Find("Universal Render Pipeline/Lit");

        if (shader == null)
        {
            shader = Shader.Find("Standard");
        }

        Material material = new Material(shader);
        material.name = materialName;
        material.color = color;
        return material;
    }
}

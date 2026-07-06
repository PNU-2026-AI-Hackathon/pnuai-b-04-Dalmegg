using UnityEngine;

public class UrbanVacantSpaceBuilder : MonoBehaviour
{
    [Header("Room Size")]
    [SerializeField] private Vector3 roomSize = new Vector3(7f, 3.2f, 5f);
    [SerializeField] private float wallThickness = 0.08f;

    [Header("Layout")]
    [SerializeField] private Vector3 farmCenter = Vector3.zero;
    [SerializeField] private bool buildOnStart;

    private Material concreteMaterial;
    private Material wallMaterial;
    private Material windowMaterial;
    private Material frameMaterial;
    private Material metalMaterial;
    private Material boxMaterial;
    private Material lightMaterial;
    private Material cityMaterial;

    private void Start()
    {
        if (buildOnStart && transform.childCount == 0)
        {
            BuildBackground();
        }
    }

    [ContextMenu("Build Urban Vacant Space")]
    public void BuildBackground()
    {
        ClearBackground();
        CreateMaterials();

        CreateRoom();
        CreateWindowAndCityView();
        CreateSmartFarmEquipment();
        CreateVacantSpaceProps();
    }

    [ContextMenu("Clear Urban Vacant Space")]
    public void ClearBackground()
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

    private void CreateRoom()
    {
        float width = roomSize.x;
        float height = roomSize.y;
        float depth = roomSize.z;

        CreateCube("ConcreteFloor", farmCenter + new Vector3(0f, -0.04f, 0f), new Vector3(width, wallThickness, depth), concreteMaterial);
        CreateCube("BackWall", farmCenter + new Vector3(0f, height * 0.5f, depth * 0.5f), new Vector3(width, height, wallThickness), wallMaterial);
        CreateCube("LeftWall", farmCenter + new Vector3(-width * 0.5f, height * 0.5f, 0f), new Vector3(wallThickness, height, depth), wallMaterial);
        CreateCube("RightWall", farmCenter + new Vector3(width * 0.5f, height * 0.5f, 0f), new Vector3(wallThickness, height, depth), wallMaterial);
        CreateCube("CeilingBeam", farmCenter + new Vector3(0f, height - 0.2f, -0.6f), new Vector3(width * 0.85f, 0.08f, 0.1f), metalMaterial);
    }

    private void CreateWindowAndCityView()
    {
        float backZ = farmCenter.z + roomSize.z * 0.5f - wallThickness;

        CreateCube("WindowGlass", farmCenter + new Vector3(0f, 1.95f, backZ - 0.02f), new Vector3(2.4f, 1.05f, 0.03f), windowMaterial);
        CreateCube("WindowFrameTop", farmCenter + new Vector3(0f, 2.5f, backZ - 0.05f), new Vector3(2.55f, 0.08f, 0.08f), frameMaterial);
        CreateCube("WindowFrameBottom", farmCenter + new Vector3(0f, 1.4f, backZ - 0.05f), new Vector3(2.55f, 0.08f, 0.08f), frameMaterial);
        CreateCube("WindowFrameLeft", farmCenter + new Vector3(-1.27f, 1.95f, backZ - 0.05f), new Vector3(0.08f, 1.15f, 0.08f), frameMaterial);
        CreateCube("WindowFrameRight", farmCenter + new Vector3(1.27f, 1.95f, backZ - 0.05f), new Vector3(0.08f, 1.15f, 0.08f), frameMaterial);
        CreateCube("WindowFrameMiddle", farmCenter + new Vector3(0f, 1.95f, backZ - 0.06f), new Vector3(0.06f, 1.15f, 0.08f), frameMaterial);

        CreateCube("CityBuildingA", farmCenter + new Vector3(-0.9f, 1.45f, backZ + 0.2f), new Vector3(0.45f, 0.75f, 0.08f), cityMaterial);
        CreateCube("CityBuildingB", farmCenter + new Vector3(-0.25f, 1.6f, backZ + 0.2f), new Vector3(0.5f, 1.05f, 0.08f), cityMaterial);
        CreateCube("CityBuildingC", farmCenter + new Vector3(0.55f, 1.5f, backZ + 0.2f), new Vector3(0.6f, 0.85f, 0.08f), cityMaterial);
    }

    private void CreateSmartFarmEquipment()
    {
        CreateCube("GrowLightBar", farmCenter + new Vector3(0f, 2.45f, -0.15f), new Vector3(1.8f, 0.06f, 0.08f), lightMaterial);
        CreateCube("GrowLightCableLeft", farmCenter + new Vector3(-0.8f, 2.68f, -0.15f), new Vector3(0.025f, 0.45f, 0.025f), metalMaterial);
        CreateCube("GrowLightCableRight", farmCenter + new Vector3(0.8f, 2.68f, -0.15f), new Vector3(0.025f, 0.45f, 0.025f), metalMaterial);

        CreateCube("SensorPole", farmCenter + new Vector3(1.2f, 0.65f, 0.1f), new Vector3(0.04f, 1.3f, 0.04f), metalMaterial);
        CreateCube("SensorBox", farmCenter + new Vector3(1.2f, 1.25f, 0.1f), new Vector3(0.28f, 0.18f, 0.16f), metalMaterial);
        CreateCube("ControlUnit", farmCenter + new Vector3(-1.25f, 0.45f, 0.35f), new Vector3(0.55f, 0.5f, 0.25f), metalMaterial);
    }

    private void CreateVacantSpaceProps()
    {
        CreateCube("UnusedShelfLeft", farmCenter + new Vector3(-2.55f, 0.75f, 0.75f), new Vector3(0.08f, 1.5f, 0.9f), metalMaterial);
        CreateCube("UnusedShelfRight", farmCenter + new Vector3(-1.65f, 0.75f, 0.75f), new Vector3(0.08f, 1.5f, 0.9f), metalMaterial);
        CreateCube("UnusedShelfBoardA", farmCenter + new Vector3(-2.1f, 0.45f, 0.75f), new Vector3(1f, 0.06f, 0.9f), metalMaterial);
        CreateCube("UnusedShelfBoardB", farmCenter + new Vector3(-2.1f, 1.05f, 0.75f), new Vector3(1f, 0.06f, 0.9f), metalMaterial);

        CreateCube("CardboardBoxA", farmCenter + new Vector3(2.35f, 0.18f, 1.25f), new Vector3(0.55f, 0.36f, 0.42f), boxMaterial);
        CreateCube("CardboardBoxB", farmCenter + new Vector3(2.0f, 0.13f, 0.75f), new Vector3(0.42f, 0.26f, 0.36f), boxMaterial);
        CreateCube("OldPipeBack", farmCenter + new Vector3(0f, 2.85f, 2.42f), new Vector3(4.8f, 0.08f, 0.08f), metalMaterial);
    }

    private GameObject CreateCube(string objectName, Vector3 localPosition, Vector3 localScale, Material material)
    {
        GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cube.name = objectName;
        cube.transform.SetParent(transform);
        cube.transform.localPosition = localPosition;
        cube.transform.localRotation = Quaternion.identity;
        cube.transform.localScale = localScale;

        Renderer renderer = cube.GetComponent<Renderer>();

        if (renderer != null && material != null)
        {
            renderer.sharedMaterial = material;
        }

        return cube;
    }

    private void CreateMaterials()
    {
        concreteMaterial = CreateMaterial("Urban Concrete", new Color(0.48f, 0.52f, 0.45f));
        wallMaterial = CreateMaterial("Vacant Wall", new Color(0.72f, 0.73f, 0.68f));
        windowMaterial = CreateMaterial("Muted Window", new Color(0.47f, 0.62f, 0.72f, 0.55f));
        frameMaterial = CreateMaterial("Window Frame", new Color(0.25f, 0.27f, 0.28f));
        metalMaterial = CreateMaterial("Utility Metal", new Color(0.33f, 0.37f, 0.36f));
        boxMaterial = CreateMaterial("Stored Cardboard", new Color(0.58f, 0.42f, 0.27f));
        lightMaterial = CreateMaterial("Grow Light", new Color(0.68f, 1f, 0.82f));
        cityMaterial = CreateMaterial("Distant City", new Color(0.36f, 0.4f, 0.43f));
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

using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Scene References")]
    [SerializeField] private EnvironmentController environmentController;
    [SerializeField] private GrowthSimulator growthSimulator;
    [SerializeField] private FlowerController flowerController;

    public EnvironmentController EnvironmentController => environmentController;
    public GrowthSimulator GrowthSimulator => growthSimulator;
    public FlowerController FlowerController => flowerController;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        CacheSceneReferences();
    }

    private void Start()
    {
        CacheSceneReferences();

        if (environmentController != null && growthSimulator != null)
        {
            growthSimulator.RecalculateGrowth(environmentController);
        }
    }

    private void OnDestroy()
    {
        if (Instance == this)
        {
            Instance = null;
        }
    }

    public void CacheSceneReferences()
    {
        if (environmentController == null)
        {
            environmentController = Object.FindFirstObjectByType<EnvironmentController>();
        }

        if (growthSimulator == null)
        {
            growthSimulator = Object.FindFirstObjectByType<GrowthSimulator>();
        }

        if (flowerController == null)
        {
            flowerController = Object.FindFirstObjectByType<FlowerController>();
        }

        if (environmentController != null)
        {
            environmentController.SetGrowthSimulator(growthSimulator);
        }

        if (growthSimulator != null)
        {
            growthSimulator.SetFlowerController(flowerController);
        }
    }
}

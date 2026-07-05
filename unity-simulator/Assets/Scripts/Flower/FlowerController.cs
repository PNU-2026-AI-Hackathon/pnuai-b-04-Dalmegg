using UnityEngine;

public class FlowerController : MonoBehaviour
{
    [Header("Flower Object")]
    [Tooltip("Sphere 또는 꽃 모델의 Renderer를 연결합니다.")]
    public Renderer flowerRenderer;
    [SerializeField] private Renderer[] flowerRenderers;

    [Header("Growth Scale Multipliers")]
    [SerializeField] private float witheredMinScale = 0.35f;
    [SerializeField] private float witheredMaxScale = 0.5f;
    [SerializeField] private float seedMinScale = 0.25f;
    [SerializeField] private float seedMaxScale = 0.45f;
    [SerializeField] private float growingMinScale = 0.75f;
    [SerializeField] private float growingMaxScale = 1f;
    [SerializeField] private float bloomMinScale = 1.15f;
    [SerializeField] private float bloomMaxScale = 1.35f;

    private Vector3 baseScale;
    private Material[] flowerMaterials;

    private void Awake()
    {
        baseScale = transform.localScale;
        ResolveRenderers();
        CacheMaterials();
    }

    private void Reset()
    {
        baseScale = transform.localScale;
        ResolveRenderers();
    }

    public void ApplyGrowth(float growthScore, GrowthStage growthStage)
    {
        float normalizedScore = Mathf.Clamp01(growthScore / 100f);
        float scale = 1f;
        Color color = Color.white;

        switch (growthStage)
        {
            case GrowthStage.Withered:
                scale = Mathf.Lerp(witheredMinScale, witheredMaxScale, normalizedScore);
                color = new Color(0.18f, 0.14f, 0.1f);
                break;

            case GrowthStage.Seed:
                scale = Mathf.Lerp(seedMinScale, seedMaxScale, Mathf.InverseLerp(25f, 49f, growthScore));
                color = new Color(0.28f, 0.5f, 0.2f);
                break;

            case GrowthStage.Growing:
                scale = Mathf.Lerp(growingMinScale, growingMaxScale, Mathf.InverseLerp(50f, 74f, growthScore));
                color = new Color(0.45f, 0.85f, 0.35f);
                break;

            case GrowthStage.Bloom:
                scale = Mathf.Lerp(bloomMinScale, bloomMaxScale, Mathf.InverseLerp(75f, 100f, growthScore));
                color = new Color(1f, 0.35f, 0.62f);
                break;
        }

        transform.localScale = baseScale * scale;
        ApplyColor(color);
    }

    private void ResolveRenderers()
    {
        if (flowerRenderer == null)
        {
            flowerRenderer = GetComponent<Renderer>();
        }

        if (flowerRenderer == null)
        {
            flowerRenderer = GetComponentInChildren<Renderer>();
        }

        if (flowerRenderers == null || flowerRenderers.Length == 0)
        {
            flowerRenderers = GetComponentsInChildren<Renderer>();
        }

        if (flowerRenderer == null && flowerRenderers != null && flowerRenderers.Length > 0)
        {
            flowerRenderer = flowerRenderers[0];
        }
    }

    private void CacheMaterials()
    {
        ResolveRenderers();

        if (flowerRenderers == null || flowerRenderers.Length == 0)
        {
            flowerMaterials = null;
            return;
        }

        flowerMaterials = new Material[flowerRenderers.Length];

        for (int i = 0; i < flowerRenderers.Length; i++)
        {
            if (flowerRenderers[i] != null)
            {
                flowerMaterials[i] = flowerRenderers[i].material;
            }
        }
    }

    private void ApplyColor(Color color)
    {
        if (flowerMaterials == null || flowerMaterials.Length == 0)
        {
            CacheMaterials();
        }

        if (flowerMaterials == null)
        {
            return;
        }

        for (int i = 0; i < flowerMaterials.Length; i++)
        {
            Material material = flowerMaterials[i];

            if (material == null)
            {
                continue;
            }

            if (material.HasProperty("_BaseColor"))
            {
                material.SetColor("_BaseColor", color);
            }

            if (material.HasProperty("_Color"))
            {
                material.SetColor("_Color", color);
            }
        }
    }
}

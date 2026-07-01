using UnityEngine;

public class FlowerController : MonoBehaviour
{
    [Header("Flower Object")]
    [Tooltip("Sphere 또는 꽃 모델의 Renderer를 연결합니다.")]
    public Renderer flowerRenderer;

    private Material flowerMaterial;

    private void Awake()
    {
        ResolveRenderer();
        CacheMaterial();
    }

    private void Reset()
    {
        ResolveRenderer();
    }

    public void ApplyGrowth(float growthScore, GrowthStage growthStage)
    {
        float normalizedScore = Mathf.Clamp01(growthScore / 100f);
        float scale = 1f;
        Color color = Color.white;

        switch (growthStage)
        {
            case GrowthStage.Withered:
                scale = Mathf.Lerp(0.2f, 0.35f, normalizedScore);
                color = new Color(0.18f, 0.14f, 0.1f);
                break;

            case GrowthStage.Seed:
                scale = Mathf.Lerp(0.18f, 0.45f, Mathf.InverseLerp(25f, 49f, growthScore));
                color = new Color(0.28f, 0.5f, 0.2f);
                break;

            case GrowthStage.Growing:
                scale = Mathf.Lerp(0.55f, 0.95f, Mathf.InverseLerp(50f, 74f, growthScore));
                color = new Color(0.45f, 0.85f, 0.35f);
                break;

            case GrowthStage.Bloom:
                scale = Mathf.Lerp(1.1f, 1.6f, Mathf.InverseLerp(75f, 100f, growthScore));
                color = new Color(1f, 0.35f, 0.62f);
                break;
        }

        transform.localScale = Vector3.one * scale;
        ApplyColor(color);
    }

    private void ResolveRenderer()
    {
        if (flowerRenderer == null)
        {
            flowerRenderer = GetComponent<Renderer>();
        }

        if (flowerRenderer == null)
        {
            flowerRenderer = GetComponentInChildren<Renderer>();
        }
    }

    private void CacheMaterial()
    {
        ResolveRenderer();

        if (flowerRenderer == null)
        {
            flowerMaterial = null;
            return;
        }

        flowerMaterial = flowerRenderer.material;
    }

    private void ApplyColor(Color color)
    {
        if (flowerMaterial == null)
        {
            CacheMaterial();
        }

        if (flowerMaterial == null)
        {
            return;
        }

        if (flowerMaterial.HasProperty("_BaseColor"))
        {
            flowerMaterial.SetColor("_BaseColor", color);
        }

        if (flowerMaterial.HasProperty("_Color"))
        {
            flowerMaterial.SetColor("_Color", color);
        }
    }
}

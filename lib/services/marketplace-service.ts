/**
 * House of Veritas - Marketplace Integration Service
 *
 * Integrates with South African marketplaces:
 * - Gumtree (via unofficial API / web automation)
 * - Facebook Marketplace (via Graph API)
 * - OLX (via unofficial API)
 *
 * Note: Some platforms don't have official APIs, so we use
 * web automation or unofficial endpoints where necessary.
 */

// Types
export interface MarketplaceListing {
  title: string
  description: string
  price: number
  currency: string
  category: string
  subcategory?: string
  condition: string
  location: {
    city: string
    province: string
    postalCode?: string
  }
  images: string[]
  contactName: string
  contactPhone?: string
  contactEmail?: string
  attributes?: Record<string, string>
}

export interface ListingResult {
  success: boolean
  platform: string
  listingId?: string
  listingUrl?: string
  error?: string
  requiresManualAction?: boolean
  manualInstructions?: string
}

export interface MarketplaceConfig {
  platform: string
  enabled: boolean
  credentials?: {
    apiKey?: string
    accessToken?: string
    refreshToken?: string
    username?: string
    password?: string
  }
  settings?: Record<string, any>
}

// Platform-specific category mappings
const CATEGORY_MAPPINGS: Record<string, Record<string, string>> = {
  gumtree: {
    vehicles: "cars-bakkies",
    garden_equipment: "garden",
    workshop_tools: "tools-diy",
    household_items: "home-garden",
    electronics: "electronics",
    furniture: "furniture",
    outdoor_furniture: "patio-garden-furniture",
    safety_equipment: "other",
  },
  facebook: {
    vehicles: "vehicles",
    garden_equipment: "garden_outdoor",
    workshop_tools: "tools",
    household_items: "home_goods",
    electronics: "electronics",
    furniture: "furniture",
    outdoor_furniture: "garden_outdoor",
    safety_equipment: "miscellaneous",
  },
  olx: {
    vehicles: "vehicles",
    garden_equipment: "home-garden",
    workshop_tools: "services",
    household_items: "home-garden",
    electronics: "electronics",
    furniture: "furniture",
    outdoor_furniture: "home-garden",
    safety_equipment: "other",
  },
}

// Gumtree Integration (South Africa)
export class GumtreeService {
  private baseUrl = "https://www.gumtree.co.za"
  private apiUrl = "https://api.gumtree.co.za" // Unofficial
  private credentials?: MarketplaceConfig["credentials"]

  constructor(config?: MarketplaceConfig) {
    this.credentials = config?.credentials
  }

  async createListing(listing: MarketplaceListing): Promise<ListingResult> {
    // Gumtree doesn't have an official API, so we provide manual instructions
    // In production, you could use Puppeteer/Playwright for automation

    const category = CATEGORY_MAPPINGS.gumtree[listing.category] || "other"
    const postUrl = `${this.baseUrl}/post?category=${category}`

    // Generate pre-filled URL with parameters
    const params = new URLSearchParams({
      title: listing.title,
      price: listing.price.toString(),
      description: listing.description,
      condition: listing.condition,
      location: `${listing.location.city}, ${listing.location.province}`,
    })

    // If we have credentials, attempt automated posting
    if (this.credentials?.username && this.credentials?.password) {
      try {
        // In production: Use Puppeteer to automate the posting process
        // For now, return manual instructions
        return {
          success: true,
          platform: "gumtree",
          requiresManualAction: true,
          manualInstructions: `
1. Go to: ${postUrl}
2. Log in with your Gumtree account
3. Fill in the listing details:
   - Title: ${listing.title}
   - Price: R${listing.price}
   - Category: ${category}
   - Condition: ${listing.condition}
4. Upload images
5. Submit the listing

Pre-filled form URL: ${postUrl}?${params.toString()}
          `.trim(),
        }
      } catch (error) {
        return {
          success: false,
          platform: "gumtree",
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    return {
      success: true,
      platform: "gumtree",
      requiresManualAction: true,
      listingUrl: `${postUrl}?${params.toString()}`,
      manualInstructions: `Visit Gumtree to complete your listing: ${postUrl}`,
    }
  }

  async getListingStatus(listingId: string): Promise<any> {
    // Would require web scraping or unofficial API
    return { status: "unknown", message: "Manual verification required" }
  }

  generateShareableLink(listing: MarketplaceListing): string {
    const category = CATEGORY_MAPPINGS.gumtree[listing.category] || "other"
    const searchQuery = encodeURIComponent(listing.title)
    return `${this.baseUrl}/s-${category}/${searchQuery}/v1q0p1`
  }
}

// Facebook Marketplace Integration
export class FacebookMarketplaceService {
  private graphApiUrl = "https://graph.facebook.com/v18.0"
  private accessToken?: string
  private pageId?: string

  constructor(config?: MarketplaceConfig) {
    this.accessToken = config?.credentials?.accessToken
    this.pageId = config?.settings?.pageId
  }

  async createListing(listing: MarketplaceListing): Promise<ListingResult> {
    if (!this.accessToken) {
      return {
        success: true,
        platform: "facebook",
        requiresManualAction: true,
        listingUrl: "https://www.facebook.com/marketplace/create/item",
        manualInstructions: `
To list on Facebook Marketplace:
1. Go to Facebook Marketplace
2. Click "Create new listing"
3. Select "Item for Sale"
4. Fill in:
   - Title: ${listing.title}
   - Price: R${listing.price}
   - Category: ${CATEGORY_MAPPINGS.facebook[listing.category] || "Miscellaneous"}
   - Condition: ${listing.condition}
   - Description: ${listing.description}
5. Add photos
6. Set your location
7. Publish

Note: For automated posting, configure Facebook Page access token.
        `.trim(),
      }
    }

    try {
      // Facebook Commerce API (requires approved app and business verification)
      const response = await fetch(`${this.graphApiUrl}/${this.pageId}/commerce_listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          name: listing.title,
          description: listing.description,
          price: listing.price * 100, // Cents
          currency: "ZAR",
          condition: listing.condition.toUpperCase(),
          availability: "IN_STOCK",
          category: CATEGORY_MAPPINGS.facebook[listing.category],
          images: listing.images.map((url) => ({ url })),
        }),
      })

      const data = await response.json()

      if (data.id) {
        return {
          success: true,
          platform: "facebook",
          listingId: data.id,
          listingUrl: `https://www.facebook.com/marketplace/item/${data.id}`,
        }
      } else {
        throw new Error(data.error?.message || "Failed to create listing")
      }
    } catch (error) {
      return {
        success: false,
        platform: "facebook",
        error: error instanceof Error ? error.message : String(error),
        requiresManualAction: true,
        manualInstructions: "Please create the listing manually on Facebook Marketplace",
      }
    }
  }

  async getListingInsights(listingId: string): Promise<any> {
    if (!this.accessToken) {
      return { error: "Access token required" }
    }

    try {
      const response = await fetch(
        `${this.graphApiUrl}/${listingId}/insights?metric=post_impressions,post_engagements`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      )
      return await response.json()
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  }
}

// OLX Integration (South Africa)
export class OLXService {
  private baseUrl = "https://www.olx.co.za"
  private apiUrl = "https://api.olx.co.za" // Unofficial
  private credentials?: MarketplaceConfig["credentials"]

  constructor(config?: MarketplaceConfig) {
    this.credentials = config?.credentials
  }

  async createListing(listing: MarketplaceListing): Promise<ListingResult> {
    // OLX also lacks official API - provide manual instructions
    const category = CATEGORY_MAPPINGS.olx[listing.category] || "other"
    const postUrl = `${this.baseUrl}/posting`

    return {
      success: true,
      platform: "olx",
      requiresManualAction: true,
      listingUrl: postUrl,
      manualInstructions: `
To list on OLX South Africa:
1. Go to: ${postUrl}
2. Log in or create an account
3. Select category: ${category}
4. Fill in listing details:
   - Title: ${listing.title}
   - Price: R${listing.price}
   - Description: ${listing.description}
   - Condition: ${listing.condition}
   - Location: ${listing.location.city}, ${listing.location.province}
5. Upload photos
6. Submit for review

Tip: OLX listings typically go live within 24 hours after review.
      `.trim(),
    }
  }
}

// BidOrBuy Integration (South Africa)
export class BidOrBuyService {
  private baseUrl = "https://www.bidorbuy.co.za"
  private apiKey?: string

  constructor(config?: MarketplaceConfig) {
    this.apiKey = config?.credentials?.apiKey
  }

  async createListing(listing: MarketplaceListing): Promise<ListingResult> {
    // BidOrBuy has a seller API but requires merchant registration
    const sellUrl = `${this.baseUrl}/seller/item/add`

    if (!this.apiKey) {
      return {
        success: true,
        platform: "bidorbuy",
        requiresManualAction: true,
        listingUrl: sellUrl,
        manualInstructions: `
To list on BidOrBuy:
1. Register as a seller at ${this.baseUrl}/seller
2. Go to: ${sellUrl}
3. Create your listing:
   - Title: ${listing.title}
   - Starting Price: R${listing.price}
   - Category: Select appropriate category
   - Condition: ${listing.condition}
   - Description: ${listing.description}
4. Choose selling format (Auction or Buy Now)
5. Upload photos
6. Publish listing

Note: BidOrBuy charges seller fees. Configure API key for automated posting.
        `.trim(),
      }
    }

    // Would implement actual API call here
    return {
      success: true,
      platform: "bidorbuy",
      requiresManualAction: true,
      manualInstructions: "API integration pending merchant verification",
    }
  }
}

// AutoTrader Integration (for vehicles)
export class AutoTraderService {
  private baseUrl = "https://www.autotrader.co.za"
  private dealerId?: string
  private apiKey?: string

  constructor(config?: MarketplaceConfig) {
    this.dealerId = config?.settings?.dealerId
    this.apiKey = config?.credentials?.apiKey
  }

  async createListing(listing: MarketplaceListing): Promise<ListingResult> {
    if (listing.category !== "vehicles") {
      return {
        success: false,
        platform: "autotrader",
        error: "AutoTrader is only for vehicles",
      }
    }

    const postUrl = `${this.baseUrl}/sell-my-car`

    return {
      success: true,
      platform: "autotrader",
      requiresManualAction: true,
      listingUrl: postUrl,
      manualInstructions: `
To list your vehicle on AutoTrader:
1. Go to: ${postUrl}
2. Enter vehicle details:
   - Make/Model from title: ${listing.title}
   - Price: R${listing.price}
   - Condition: ${listing.condition}
3. Add vehicle specifications
4. Upload high-quality photos
5. Set your contact preferences
6. Submit listing

Note: AutoTrader listings get high visibility for vehicle sales.
      `.trim(),
    }
  }
}

// Main Marketplace Service - orchestrates all platforms
export class MarketplaceService {
  private gumtree: GumtreeService
  private facebook: FacebookMarketplaceService
  private olx: OLXService
  private bidorbuy: BidOrBuyService
  private autotrader: AutoTraderService
  private configs: Map<string, MarketplaceConfig>

  constructor(configs?: MarketplaceConfig[]) {
    this.configs = new Map()
    configs?.forEach((c) => this.configs.set(c.platform, c))

    this.gumtree = new GumtreeService(this.configs.get("gumtree"))
    this.facebook = new FacebookMarketplaceService(this.configs.get("facebook"))
    this.olx = new OLXService(this.configs.get("olx"))
    this.bidorbuy = new BidOrBuyService(this.configs.get("bidorbuy"))
    this.autotrader = new AutoTraderService(this.configs.get("autotrader"))
  }

  async publishToMultiplePlatforms(
    listing: MarketplaceListing,
    platforms: string[]
  ): Promise<ListingResult[]> {
    const results: ListingResult[] = []

    for (const platform of platforms) {
      let result: ListingResult

      switch (platform.toLowerCase()) {
        case "gumtree":
          result = await this.gumtree.createListing(listing)
          break
        case "facebook":
          result = await this.facebook.createListing(listing)
          break
        case "olx":
          result = await this.olx.createListing(listing)
          break
        case "bidorbuy":
          result = await this.bidorbuy.createListing(listing)
          break
        case "autotrader":
          result = await this.autotrader.createListing(listing)
          break
        default:
          result = {
            success: false,
            platform,
            error: `Unknown platform: ${platform}`,
          }
      }

      results.push(result)
    }

    return results
  }

  getSupportedPlatforms(): Array<{
    id: string
    name: string
    url: string
    hasApi: boolean
    categories: string[]
  }> {
    return [
      {
        id: "gumtree",
        name: "Gumtree South Africa",
        url: "https://www.gumtree.co.za",
        hasApi: false,
        categories: ["vehicles", "electronics", "furniture", "garden", "tools"],
      },
      {
        id: "facebook",
        name: "Facebook Marketplace",
        url: "https://www.facebook.com/marketplace",
        hasApi: true,
        categories: ["vehicles", "electronics", "furniture", "home", "garden"],
      },
      {
        id: "olx",
        name: "OLX South Africa",
        url: "https://www.olx.co.za",
        hasApi: false,
        categories: ["vehicles", "electronics", "property", "jobs", "services"],
      },
      {
        id: "bidorbuy",
        name: "BidOrBuy",
        url: "https://www.bidorbuy.co.za",
        hasApi: true,
        categories: ["all"],
      },
      {
        id: "autotrader",
        name: "AutoTrader",
        url: "https://www.autotrader.co.za",
        hasApi: true,
        categories: ["vehicles"],
      },
    ]
  }

  async generateListingContent(
    assetName: string,
    assetDetails: Record<string, any>
  ): Promise<{ title: string; description: string; suggestedPrice: number }> {
    // In production, use AI to generate compelling listing copy
    const condition = assetDetails.condition || "Good"
    const brand = assetDetails.brand || ""
    const model = assetDetails.model || ""

    const title =
      brand && model
        ? `${brand} ${model} - ${condition} Condition`
        : `${assetName} - ${condition} Condition`

    const description = `
${assetName} for sale.

Condition: ${condition}
${brand ? `Brand: ${brand}` : ""}
${model ? `Model: ${model}` : ""}
${assetDetails.serialNumber ? `Serial Number: ${assetDetails.serialNumber}` : ""}

${assetDetails.description || "Well-maintained item from a private household."}

Located in Stellenbosch, Western Cape.
Serious buyers only. Cash on collection.

Contact for viewing arrangements.
    `.trim()

    const suggestedPrice = assetDetails.salePrice || assetDetails.currentValue || 0

    return { title, description, suggestedPrice }
  }
}

// Export singleton for use across the application
export const marketplaceService = new MarketplaceService()

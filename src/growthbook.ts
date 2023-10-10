import { GrowthBook } from '@growthbook/growthbook-react'
import { FeatureResult } from '@growthbook/growthbook/src/types/growthbook'
import * as RudderAnalytics from 'rudder-sdk-js'

export type GrowthBookType = GrowthBook

export type AttributesTypes = {
    id?: string
    country: string
    user_language: string
    device_language: string
    device_type: string
}
export class Growthbook {
    GrowthBook
    private static _instance: Growthbook

    // we have to pass settings due the specific framework implementation
    constructor(clientKey: string, decryptionKey: string) {
        this.GrowthBook = new GrowthBook<GrowthBook>({
            apiHost: 'https://cdn.growthbook.io',
            clientKey: clientKey,
            decryptionKey: decryptionKey,
            enableDevMode: true,
            subscribeToChanges: true,
            trackingCallback: (experiment, result) => {
                RudderAnalytics.track('experiment_viewed', {
                    experimentId: experiment.key,
                    variationId: result.variationId,
                })
            },
            // use it for development and testing purpose
            onFeatureUsage: (featureKey: string, result: FeatureResult<any>) => {
                console.log('feature', featureKey, 'has value', result.value)
            },
        })
        this.init()
    }

    // for make instance by singleton
    public static getGrowthBookInstance(
        clientKey: string,
        decryptionKey: string
    ) {
        if (!Growthbook._instance) {
            Growthbook._instance = new Growthbook(clientKey, decryptionKey)
            return Growthbook._instance
        }
        return Growthbook._instance
    }

    setAttributes({ id, country, user_language, device_language, device_type }: AttributesTypes) {
        return this.GrowthBook.setAttributes({
            id,
            country,
            user_language,
            device_language,
            device_type,
        })
    }
    getFeatureState<K>(id: K) {
        return this.GrowthBook.evalFeature(id)
    }
    getFeatureValue<K>(key: K) {
        return this.GrowthBook.getFeatureValue(key, 'fallback')
    }
    init() {
        return this.GrowthBook.loadFeatures().catch((err) => console.error(err))
    }
}
if __DEV__ then console.warn 'Using a Dev version of analytics'

# TODO: Dependency check should go here

import _ from 'lodash-es'
import Analytics from './analytics'



_.set bitmovin, 'player.analytics.ComscoreAnalytics', Analytics

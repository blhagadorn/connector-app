import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SplashScreen from 'react-native-splash-screen'
import {
  homeRoute,
  splashScreenRoute,
  expiredTokenRoute,
  lockSelectionRoute,
  lockEnterPinRoute,
  smsConnectionRequestRoute,
} from '../common/route-constants'
import {
  TOKEN_EXPIRED_CODE,
  PENDING_CONNECTION_REQUEST_CODE,
  PUSH_NOTIFICATION_SENT_CODE,
} from '../common/api-constants'
import {
  getSMSConnectionRequestDetails,
  authenticationRequestReceived,
  pushNotificationReceived,
  addPendingRedirection,
} from '../store'
import { handlePushNotification } from '../services'

class SplashScreenView extends PureComponent {
  componentWillReceiveProps(nextProps) {
    if (nextProps.config.isHydrated !== this.props.config.isHydrated) {
      // hydrated is changed, and if it is changed to true,
      // that means this is the only time we would get inside this if condition
      if (nextProps.config.isHydrated) {
        SplashScreen.hide()
        // now we can safely check value of isAlreadyInstalled
        if (nextProps.config.isAlreadyInstalled === false) {
          // user is opening the app for first time after installing
          this.props.navigation.navigate(lockSelectionRoute)
        } else {
          // not the first time user is opening app
          this.props.navigation.navigate(lockEnterPinRoute)
        }
      }
    }

    // check if deepLink is changed, then that means we either got token
    // or we got error or nothing happened with deep link
    if (nextProps.deepLink.isLoading !== this.props.deepLink.isLoading) {
      if (nextProps.deepLink.isLoading === false) {
        // loading deep link data is done
        if (nextProps.deepLink.token) {
          this.props.getSMSConnectionRequestDetails()
        } else {
          if (nextProps.lock.isAppLocked === false) {
            // we did not get any token and deepLink data loading is done
            SplashScreen.hide()
            this.props.navigation.navigate(homeRoute)
          } else {
            this.props.addPendingRedirection(homeRoute)
          }
        }
      }
    }

    if (
      nextProps.pushNotification.notification !==
      this.props.pushNotification.notification
    ) {
      const { notification } = nextProps.pushNotification
      if (notification && notification.type === 'auth-req') {
        //TODO: pass nextProps in place of this.props
        handlePushNotification(
          this.props,
          notification,
          splashScreenRoute,
          nextProps.lock.isAppLocked,
          this.props.addPendingRedirection
        )
      } else {
        return
      }
    }

    // check if invitation are the only props that are changed
    if (nextProps.invitation !== this.props.invitation) {
      if (nextProps.invitation.error) {
        SplashScreen.hide()

        if (
          nextProps.invitation.error.statusCode &&
          nextProps.invitation.error.statusCode === TOKEN_EXPIRED_CODE
        ) {
          if (nextProps.lock.isAppLocked === false) {
            this.props.navigation.navigate(expiredTokenRoute)
          } else {
            this.props.addPendingRedirection(expiredTokenRoute)
          }
        } else {
          if (nextProps.lock.isAppLocked === false) {
            // if we got error, then also redirect user to home page
            this.props.navigation.navigate(homeRoute)
          } else {
            this.props.addPendingRedirection(homeRoute)
          }
        }
      }

      if (nextProps.invitation.data) {
        // for invitation data
        // dont redirect manually let it resolve by default
        if (
          nextProps.invitation.data.statusCode &&
          nextProps.invitation.data.statusCode === PUSH_NOTIFICATION_SENT_CODE
        ) {
          return
        }

        // todo: separate connection-request store from invitation store
        // handle redirection when coming from deep-link
        if (
          this.props.invitation.data &&
          nextProps.invitation.data.statusCode ===
            PENDING_CONNECTION_REQUEST_CODE &&
          this.props.invitation.data.statusCode ===
            nextProps.invitation.data.statusCode
        ) {
          return
        }
      }
    }

    if (nextProps.smsConnection !== this.props.smsConnection) {
      if (nextProps.smsConnection.error) {
        if (
          nextProps.smsConnection.error.statusCode &&
          nextProps.smsConnection.error.statusCode === TOKEN_EXPIRED_CODE
        ) {
          if (nextProps.lock.isAppLocked === false) {
            this.props.navigation.navigate(expiredTokenRoute)
          } else {
            this.props.addPendingRedirection(expiredTokenRoute)
          }
        } else {
          if (nextProps.lock.isAppLocked === false) {
            // if we got error, then also redirect user to home page
            this.props.navigation.navigate(homeRoute)
          } else {
            this.props.addPendingRedirection(homeRoute)
          }
        }
      }

      // check if smsConnection payload are the only props that are changed
      if (
        nextProps.smsConnection.payload !== this.props.smsConnection.payload
      ) {
        if (
          nextProps.smsConnection.payload.statusCode ===
          PENDING_CONNECTION_REQUEST_CODE
        ) {
          if (nextProps.lock.isAppLocked === false) {
            this.props.navigation.navigate(smsConnectionRequestRoute)
          } else {
            this.props.addPendingRedirection(smsConnectionRequestRoute)
          }
        } else {
          if (nextProps.lock.isAppLocked === false) {
            this.props.navigation.navigate(homeRoute)
          } else {
            this.props.addPendingRedirection(homeRoute)
          }
        }
      }
    }
  }

  componentDidMount() {
    // It might be the case the hydration finishes
    // even before component is mounted,
    // so we need to check for pin code here as well
    if (this.props.config.isHydrated) {
      SplashScreen.hide()
      // now we can safely check value of isAlreadyInstalled
      if (this.props.config.isAlreadyInstalled === false) {
        // user is opening the app for first time after installing
        this.props.navigation.navigate(lockSelectionRoute)
      } else {
        // not the first time user is opening app
        this.props.navigation.navigate(lockEnterPinRoute)
      }
    }
  }

  render() {
    return null
  }
}

const mapStateToProps = ({
  invitation,
  config,
  deepLink,
  pushNotification,
  route,
  lock,
  smsConnection,
}) => ({
  invitation,
  config,
  deepLink,
  pushNotification,
  route,
  lock,
  smsConnection,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getSMSConnectionRequestDetails,
      authenticationRequestReceived,
      pushNotificationReceived,
      addPendingRedirection,
    },
    dispatch
  )

export default (mapStateDispatchConnection = connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashScreenView))

// @flow
import React, { PureComponent } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import type { Store } from '../../store/type-store'
import {
  CustomView,
  Container,
  CustomButton,
  ImageColorPicker,
  ConnectionTheme,
  CustomSafeAreaView,
} from '../../components'
import { DENY, CONNECT } from '../../common'
import type { FooterActionsProps } from './type-footer-actions'
import { noop } from '../../common'
import { white } from '../../common/styles/constant'

const styles = StyleSheet.create({
  buttonStyle: {
    borderLeftColor: white,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
})

export class FooterActions extends PureComponent<FooterActionsProps, void> {
  render() {
    const {
      denyTitle = DENY,
      acceptTitle = CONNECT,
      logoUrl = '',
      onDecline = noop,
      onAccept = noop,
      testID,
      disableAccept = false,
      hidePrimary = false,
    } = this.props

    return (
      <CustomSafeAreaView
        style={[{ backgroundColor: this.props.activeConnectionThemePrimary }]}
      >
        <ConnectionTheme logoUrl={logoUrl}>
          <CustomView row>
            <Container>
              <ConnectionTheme logoUrl={logoUrl}>
                <CustomButton
                  primary
                  medium
                  title={denyTitle}
                  onPress={onDecline}
                  testID={`${testID}-deny`}
                />
              </ConnectionTheme>
            </Container>
            {!hidePrimary && (
              <Container>
                <ConnectionTheme logoUrl={logoUrl}>
                  <CustomButton
                    primary
                    medium
                    title={acceptTitle}
                    onPress={onAccept}
                    testID={`${testID}-accept`}
                    style={[styles.buttonStyle]}
                    fontWeight="bold"
                  />
                </ConnectionTheme>
              </Container>
            )}
          </CustomView>
        </ConnectionTheme>
        <ImageColorPicker imageUrl={logoUrl} />
      </CustomSafeAreaView>
    )
  }
}

const mapStateToProps = (state: Store) => {
  const activeConnectionThemePrimary = state.connections.connectionThemes.active
    ? state.connections.connectionThemes.active.primary
    : white
  return {
    activeConnectionThemePrimary,
  }
}

export default connect(mapStateToProps)(FooterActions)

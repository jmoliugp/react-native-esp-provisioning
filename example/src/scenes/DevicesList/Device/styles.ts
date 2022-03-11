import { Palette } from '../../../styles/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  listContent: {
    alignContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    padding: '4%',
  },
  listElement: {
    backgroundColor: Palette.SECONDARY,
    display: 'flex',
    width: '100%',
  },
  separation: {
    backgroundColor: Palette.SEPARATION,
    height: 2,
    width: '100%',
  },
  textGroup: {
    width: '85%',
  },
  todoDescription: {
    color: Palette.SECONDARY_TEXT,
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: 'normal',
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: 'left',
  },
  todoTitle: {
    color: Palette.PRIMARY_TEXT,
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: 'normal',
    letterSpacing: 0,
    lineHeight: 24,
    textAlign: 'left',
  },
});

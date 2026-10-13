import { useEffect, useRef, type ReactNode } from 'react';
import { Keyboard, View, type StyleProp, type ViewStyle } from 'react-native';
import { useScrollHost } from './scroll-host';

/** Reveal the first invalid field, including repeated failed save attempts. */
export function FormErrorTarget({
  active,
  attempt,
  style,
  children,
}: {
  active: boolean;
  attempt: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const host = useScrollHost();
  const ref = useRef<View>(null);
  const lastAttempt = useRef(0);
  useEffect(() => {
    const submitted = attempt > lastAttempt.current;
    lastAttempt.current = attempt;
    if (!active || !host || !submitted) return;
    let mounted = true;
    function reveal() {
      ref.current?.measureInWindow((_, fieldTop) => {
        host?.ref.current
          ?.getNativeScrollRef()
          ?.measureInWindow((_, pageTop) => {
            if (mounted)
              host.ref.current?.scrollTo({
                y: Math.max(0, host.offset.current + fieldTop - pageTop - 20),
                animated: true,
              });
          });
      });
    }
    const subscription = Keyboard.addListener('keyboardDidHide', reveal);
    Keyboard.dismiss();
    const frame = requestAnimationFrame(reveal);
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      subscription.remove();
    };
  }, [active, attempt, host]);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}


import DebugWagmi from '~/ui/debugWagmi'
import NoSsr from "~/ui/NoSsr";

export default function DebugWagmiClient( ) {
  return (
    <NoSsr>
      <DebugWagmi/>
    </NoSsr>
  );
}

import 'react-awesome-button/dist/styles.css';
import './App.css';
import { ColorRing } from 'react-loader-spinner';
import { SignedIn, SignedOut, SignInButton, UserButton, SignOutButton } from "@clerk/clerk-react";
import Mapz from './Mapz';

export const colorRingColors = [
  '#5AAF94',
  '#FFFFF2',
  '#791E94',
  '#A38560',
  '#DE6449'
]

function App() {
  const genericLoader = () => {
    return <div style={{ width: '100%', height: '100%' }}><ColorRing
      visible={true}
      height="80"
      width="80"
      style={{ margin: 'auto' }}
      ariaLabel="color-ring-loading"
      wrapperStyle={{}}
      wrapperClass="color-ring-wrapper"
      //@ts-ignore
      colors={colorRingColors}
    /></div>
  }

  return (
    <div>
      <SignedOut>
        <div style={{width: '100%', height: '100%', marginTop: '100px'}}>
          <div className='signin' style={{width: '150px', margin: 'auto'}}>
            <SignInButton />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <Mapz userButton={<UserButton />} signOutButton={<SignOutButton />} />
      </SignedIn>
    </div>
  );
}

export default App;

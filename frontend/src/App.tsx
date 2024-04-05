import 'react-awesome-button/dist/styles.css';
import './App.css';
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
  return (
    <div>
      <SignedOut>
        <div style={{width: '100%', height: '100%', marginTop: '100px'}}>
          <div className='signin' style={{width: '150px', margin: 'auto'}}>
            <img style={{width: '150px', borderRadius: '12px'}} src="logo.jpeg" alt="logo"/>

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

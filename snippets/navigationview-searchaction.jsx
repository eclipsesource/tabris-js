import {Button, Composite, NavigationView, Page, SearchAction, TextView, contentView, device} from 'tabris';

const IMAGE = device.platform === 'iOS' ? 'resources/search-black-24dp@3x.png' : 'resources/search-white-24dp@3x.png';
const proposals = ['baseball', 'batman', 'battleship', 'bangkok', 'bangladesh', 'banana'];

contentView.append(
  <NavigationView stretch>
    <SearchAction title='Search' image={IMAGE}
        onSelect={ev => ev.target.text = ''}
        onInput={ev => updateProposals(ev.text)}
        onAccept={ev => $(TextView).only().text = 'Selected "' + ev.text + '"'}/>
    <Page title='Search action'>
      <Composite center>
        <TextView/>
        <Button centerX top='prev() 10' text='Open Search' onSelect={() => action.open()}/>
      </Composite>
    </Page>
  </NavigationView>
);

const action = $(SearchAction).only();
updateProposals('');

function updateProposals(query) {
  action.proposals = proposals.filter(proposal => proposal.indexOf(query.toLowerCase()) !== -1);
}

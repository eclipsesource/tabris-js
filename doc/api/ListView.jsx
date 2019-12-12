contentView.append(
  <ListView stretch items={items}>
    <Cell padding={8} height={52}>
      <TextView centerY bind-text='item.text' font='24px'/>
    </Cell>
  </ListView>
);

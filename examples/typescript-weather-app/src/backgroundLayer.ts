import {ImageView, Composite, CompositeProperties} from 'tabris';

export default class BackgroundLayer extends Composite {
  private clouds: Array<{image: ImageView, distance: number}>;

  constructor(properties: CompositeProperties) {
    super(properties);
    this.clouds = [];
    this.on({
      resize: () => this.generateNewClouds()
    });
  }

  public scroll(offset: number) {
    this.clouds.forEach(cloud => {
      let previousTransform = cloud.image.transform;
      cloud.image.transform = {
        translationX: previousTransform.translationX,
        scaleX: previousTransform.scaleX,
        scaleY: previousTransform.scaleY,
        translationY: offset * ((cloud.distance / 10) * 0.8 + 0.2)
      };
    });
  }

  private generateNewClouds() {
    if (this.bounds.width === 0 || this.bounds.height === 0) {
      return;
    }
    this.clouds.forEach(cloud => cloud.image.dispose());
    this.clouds = [];
    let count = 6;
    let positions = this.generateDistribution(count);
    for (let i = 0; i < count; i++) {
      this.clouds[i] = this.generateCloud(positions[i], Math.random() * 10);
    }
  }

  private generateDistribution(n: number) {
    let result = [];
    let initialOffset = 140;
    let height = this.bounds.height - initialOffset;
    let extraOffset = (height * 0.2) / n;
    for (let i = 0; i < n; i++) {
      result.push(initialOffset + (i * 0.8 * (height / n) + i * extraOffset));
    }
    return result;
  }

  private generateCloud(position: number, distance: number) {
    let cloudImage = Math.ceil(Math.random() * 6);
    let horizontalOffset = Math.ceil((0.5 - Math.random()) * this.bounds.width);
    let scale = ((10 - distance) / 10) * 1.6 + 0.4;
    let image = new ImageView({
      top: position, centerX: 0,
      image: '/images/cloud' + cloudImage + '.png',
      width: this.bounds.width,
      scaleMode: 'fill',
      opacity: 0.7,
      transform: {
        translationX: horizontalOffset,
        scaleX: scale,
        scaleY: scale
      }
    }).appendTo(this);
    return {image, distance};
  }

}

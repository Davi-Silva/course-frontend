/* eslint react/prop-types: 0 */
import React, { Component } from 'react';

import { AudioPlayer } from '../styled-components/media_players.styled-component';
import {
  Wrapper,
  Title,
  Description,
  UploadedOn,
  Update,
} from '../styled-components/podcast.styled-components';

import AdvertisementSquare from '../components/UI/ads/AdvertisementSquare.component';
import SubNavBar from '../components/UI/navbar/SubNavBar.component';

export default class Podcast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: '',
      title: '',
      description: '',
      uploadedOn: null,
      updatedOn: null,
      audioFileUrl: null,
      cover: null,
      coverAlt: '',
    };

    this.getPodcastBySlug = this.getPodcastBySlug.bind(this);
    this.setStateAsync = this.setStateAsync.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  async componentDidMount() {
    const podcast = await this.getPodcastBySlug();
    if (podcast.length > 0) {
      const {
        slug, category, title, description, uploadedOn, updatedOn, audioFile, cover,
      } = podcast[0];
      const dateFormatted = this.parseDate(uploadedOn);
      const months = [
        'January',
        'February',
        'March',
        'April',
        'may',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const formattedDate = `${months[dateFormatted.getMonth()]} ${dateFormatted.getDate()} ${dateFormatted.getFullYear()}`;
      if (updatedOn === null) {
        await this.setStateAsync({
          slug,
          category,
          title,
          description,
          uploadedOn: formattedDate,
          audioFileUrl: audioFile.url,
          cover: cover.url,
          coverAlt: cover.name,
        });
      }
      if (updatedOn !== null) {
        const dateFormattedUpdated = this.parseDate(updatedOn);
        const formattedDateUpdated = `${months[dateFormattedUpdated.getMonth()]} ${dateFormattedUpdated.getDate()} ${dateFormattedUpdated.getFullYear()}`;
        await this.setStateAsync({
          slug,
          category,
          title,
          description,
          uploadedOn: formattedDate,
          updatedOn: formattedDateUpdated,
          audioFileUrl: audioFile.url,
          cover: cover.url,
          coverAlt: cover.name,
        });
      }
    } else {
      const { history } = this.props;
      history.push('/404');
    }
  }

  async getPodcastBySlug() {
    const { match } = this.props;
    const { slug } = match.params;
    this.response = await fetch(
      `http://localhost:5000/podcasts/get/${slug}`,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await this.response.json();
    return data;
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  parseDate(input) {
    this.parts = input.match(/(\d+)/g);
    return new Date(this.parts[0], this.parts[1] - 1, this.parts[2]);
  }

  render() {
    const {
      cover, coverAlt, uploadedOn, updatedOn, category, title, audioFileUrl, description,
    } = this.state;
    const { match } = this.props;
    const { slug } = match.params;
    let podcastUpdated;
    if (updatedOn === null) {
      podcastUpdated = (
        <UploadedOn>
      Uploaded on&nbsp;
          <span style={{ color: '#0058e4' }}>{uploadedOn}</span>
        </UploadedOn>
      );
    } else if (updatedOn !== null) {
      podcastUpdated = (
        <UploadedOn>
        Updated on&nbsp;
          <span style={{ color: '#0058e4' }}>{updatedOn}</span>
        </UploadedOn>
      );
    }
    return (
      <>
        <SubNavBar media="Podcast" category={category} title={title} />
        <div className="container">
          <div className="row">
            <div className="col-lg-9 col-md-9 col-sm-12 col-12">
              <Wrapper>
                <img
                  src={cover}
                  alt={coverAlt}
                  style={{ width: '100%' }}
                />
                <Update to={`/edit/podcast/${slug}`}>
                  <i className="fas fa-edit" />
                </Update>
                {podcastUpdated}
                <Title>{title}</Title>
                <AudioPlayer
                  controls
                  name="podcast"
                  style={{ width: '100%', padding: '0px 25px' }}
                  src={audioFileUrl}
                  type="audio/mp3"
                />
                <Description
                  dangerouslySetInnerHTML={{ __html: description }}
                  style={{ textAlign: 'justify' }}
                />
              </Wrapper>
            </div>
            <div className="col-lg-3 col-md-3 col-sm-12 col-12">
              <aside style={{ marginTop: '20px' }}>
                <AdvertisementSquare />
              </aside>
            </div>
          </div>
        </div>
      </>
    );
  }
}

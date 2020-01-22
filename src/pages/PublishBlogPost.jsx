import React, { Component } from 'react';

import { uniqueId } from 'lodash';
import filesize from 'filesize';
import slugify from 'slugify';
import { Editor } from '@tinymce/tinymce-react';

import api from '../services/api';

import UploadCover from '../components/UI/admin/UploadFieldBlogPostCover.component';
import FileListCover from '../components/UI/admin/FileListBlogPostCover.component';
import SubNavBar from '../components/UI/navbar/SubNavBar';

import {
  Input,
  Select,
  Button,
  Warning,
  BlogPostCoverUploaderPlaceholder,
} from '../styled-components/forms.styled-components';

export default class PublishBlogPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSlugValid: true,
      type: '',
      slug: '',
      title: '',
      category: '',
      tags: '',
      tagsArray: [],
      content: '',
      uploaded: null,
      uploadedCovers: [],
      coverUploaded: false,
      author: '',
      allFieldsFilled: false,
      enableCoverUploader: false,
      warning: false,
    };
    this.verifySlug = this.verifySlug.bind(this);
    this.publishPost = this.publishPost.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);
    this.onChangeTags = this.onChangeTags.bind(this);
    this.disabledSubmitButton = this.disabledSubmitButton.bind(this);
    this.handleUploadCover = this.handleUploadCover.bind(this);
    this.handleDeleteCover = this.handleDeleteCover.bind(this);
    this.changeSlugFromTitle = this.changeSlugFromTitle.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.tagsToArray = this.tagsToArray.bind(this);
    this.appendPostToAuthor = this.appendPostToAuthor.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
  }

  async componentDidMount() {
    const { title } = this.state;
    const { userInfo } = this.props;
    const responseCover = await api.get(`/blog/cover/${title}`);

    this.setState({
      uploadedCovers: responseCover.data.map((file) => ({
        id: file._id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url,
      })),
    });
  }

  async componentDidUpdate() {
    const {
      uploaded,
      // uploadedCovers
    } = this.state;
    const res = await this.setGlobalVariable();
    if (uploaded) {
      this.props.history.push('/admin');
    }
  }

  async onChangeType(e) {
    await this.setStateAsync({ type: e.target.value });
    this.disabledSubmitButton();
  }


  async onChangeTitle(e) {
    const {
      title,
      uploadedCovers,
    } = this.state;
    if (uploadedCovers.length === 0) {
      if (title.length <= 100) {
        this.setStateAsync({
          title: e.target.value
        });
      } else {
        this.setStateAsync({
          title: title.substring(0, title.length - 1),
        });
      }
  
      setTimeout(() => {
        this.changeSlugFromTitle(title);
        this.enableCoverUploader(title);
        this.disabledSubmitButton();
      }, 0);
    }
  }

  async enableCoverUploader(title) {
    if (title.length > 0) {
      setTimeout(() => {
        this.setStateAsync({
          enableCoverUploader: true,
        });
      }, 0)
    } else if (title.length === 0 || title === '') {
      setTimeout(() => {
        this.setStateAsync({
          enableCoverUploader: false,
        });
      }, 0)
    }
  }

  async changeSlugFromTitle() {
    const {title} = this.state;
    let lowerCaseTitle = title.toLowerCase();
    let slug = slugify(lowerCaseTitle);
    await this.setStateAsync({ slug });
  }

  handleEditorChange = async (e) => {
    this.setStateAsync({
      content: e.target.getContent()
    });
  }


  async onChangeCategory(e) {
    this.setStateAsync({
      category: e.target.value.replace(/^\w/, (c) => c.toUpperCase()),
    });
    setTimeout(() => {
      this.disabledSubmitButton();
    }, 0);
  }

  async onChangeTags(e) {
    this.setStateAsync({
      tags: e.target.value.toLowerCase(),
    });
    setTimeout(() => {
      this.tagsToArray();
    },0 );
    setTimeout(() => {
      this.disabledSubmitButton();
    }, 0);
  }

  tagsToArray() {
    const {tags} = this.state;
    let tempTags = tags.split(', ');
    this.setStateAsync({
      tagsArray: tempTags,
    });
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  async setGlobalVariable() {
    const { title } = this.state;
    const bodyRequest = {
      type: 'blog',
      title,
    };
    const response = fetch('http://34.196.97.115:5000/admin/blog/set/global-variable', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyRequest),
    });
    // let data = await response.json();
    return response;
  }

  async verifySlug(slug) {
    this.response = await fetch(
      `http://34.196.97.115:5000/admin/blog/validation/slug/${slug}`,
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

  async appendPostToAuthor(userId, postsArray) {
    const response = fetch('http://34.196.97.115:5000/admin/user/post/to/author', {
      method: 'PUT',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        postsArray
      }),
    });
    return response;
  }

  async onSubmit(e) {
    e.preventDefault();
    const {
      isSlugValid,
      type,
      slug,
      category,
      title,
      content,
      tagsArray,
      uploadedCovers,
      allFieldsFilled,
      // author
    } = this.state;
    const {
      History,
      userInfo,
    } = this.props;
    if (allFieldsFilled) {
      const postInfo = {
        isSlugValid: isSlugValid,
        slug,
        type,
        category: category,
        title: title,
        content: content,
        tags: tagsArray,
        cover: uploadedCovers[0].id,
        author: userInfo._id,
      };
      let isSlugValidRes = await this.verifySlug(this.state.slug);
      if (isSlugValidRes.valid) {
        let res = await this.publishPost(postInfo);
        let userPostsArray = [];
        userPostsArray = userInfo.posts;
        userPostsArray.push(res)
        this.appendPostToAuthor(userInfo._id, userPostsArray);
        this.setStateAsync({
          uploaded: res.uploaded
        });
        History.push('/blog');
      } else {
      }
    } else {
      this.setStateAsync({
        warning: true,
      })
    }
  }

  async publishPost(podcast) {
    this.response = await fetch(
      'http://34.196.97.115:5000/admin/blog/publish',
      {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(podcast),
      },
    );
    const data = await this.response.json();
    return data;
  }

  async disabledSubmitButton() {
    const {
      type,
      category,
      title,
      tags,
      content,
      uploadedCovers,
      coverUploaded,
    } = this.state;
    if (type !== 'Type'
    && type !== ''
    && category !== ''
    && title !== ''
    && tags !== ''
    && content !== ''
    && uploadedCovers.length > 0
    && coverUploaded) {
      await this.setStateAsync({
        allFieldsFilled: true,
      });
    } else {
      await this.setStateAsync({
        allFieldsFilled: false,
      });
    }
  }

  handleUploadCover = files => {
    const uploadedCovers = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null
    }));

    this.setState({
      uploadedCovers: this.state.uploadedCovers.concat(uploadedCovers)
    });

    uploadedCovers.forEach(this.processUploadCover);
    setTimeout(() => {
      this.disabledSubmitButton();
    }, 0);
  };

  updateFileCover = (id, data) => {
    this.setState({
      uploadedCovers: this.state.uploadedCovers.map(uploadedCover => {
        return id === uploadedCover.id
          ? { ...uploadedCover, ...data }
          : uploadedCover;
      })
    });
  };

  processUploadCover = uploadedCovers => {
    const data = new FormData();

    data.append("file", uploadedCovers.file, uploadedCovers.name);

    api
      .post("/admin/blog/publish/cover", data, {
        onUploadProgress: e => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));

          this.updateFileCover(uploadedCovers.id, {
            progress
          });
        }
      })
      .then(response => {
        this.updateFileCover(uploadedCovers.id, {
          uploaded: true,
          id: response.data._id,
          url: response.data.url
        });
        this.setStateAsync({
          coverUploaded: true,
        })
        this.disabledSubmitButton();
      })
      .catch(() => {
        this.updateFileCover(uploadedCovers.id, {
          error: true
        });
      });
  };

  handleDeleteCover = async id => {
    await api.delete(`/admin/blog/delete/cover/${id}`);

    this.setState({
      uploadedCovers: this.state.uploadedCovers.filter(file => file.id !== id)
    });
  };

  componentWillUnmount() {
    this.state.uploadedCovers.forEach(file =>
      URL.revokeObjectURL(file.preview)
    );
  }


  render() {
    const {
      uploadedCovers,
      title,
      category,
      tags,
      warning,
      // allFieldsFilled
      enableCoverUploader,
    } = this.state;

    let coverUploader;
    let warningDiv;

    if (enableCoverUploader) {
      coverUploader = (
        <>
          <UploadCover onUpload={this.handleUploadCover} />
          {!!uploadedCovers.length && (
            <FileListCover
              files={uploadedCovers}
              onDelete={this.handleDeleteCover}
            />
          )}
        </>
      );
    } else {
      coverUploader = (
        <>
          <BlogPostCoverUploaderPlaceholder>
            <p>Give this blog post a <strong>Title</strong> before uploading a cover</p>
          </BlogPostCoverUploaderPlaceholder>
        </>
      );
    }
    if(warning) {
      warningDiv = (
        <>
          <Warning>
            All fileds must be filled
          </Warning>
        </>
      );
    } else {
      warningDiv = (
        <>
        </>
      );
    }
    
    return (
      <>
        {/* <SubNavBar media="Blog" category="Publish" title={title} /> */}
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div style={{ height: '300px', width: '100%' }}>
              {coverUploader}
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <form style={{marginTop: '25px'}} onSubmit={this.onSubmit}>
                <Select 
                name="type" 
                id="type"
                onChange={this.onChangeType}>
                  <option value="Type">Type</option>
                  <option value="Article">Article</option>
                  <option value="News">News</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Video">Video</option>
                </Select>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  value={title}
                  autoComplete="off"
                  style={{  
                    color: "#333",
                    fontSize: "26px",
                    fontWeight: "900",
                    width: "100%",
                    marginBottom: '25px',
                  }}
                  onChange={this.onChangeTitle}
                  onInput={this.enableCoverUploader}
                  required
                />
                <Input
                  type="text"
                  id="category"
                  name="category"
                  placeholder="Category..."
                  value={category}
                  autoComplete="off"
                  style={{  
                    color: "#999",
                    fontSize: "16px",
                    fontWeight: "100",
                    margin: "10px 0",
                    width: "100%"
                  }}
                  onChange={this.onChangeCategory}
                  required
                />
                <div
                  style={{
                    marginBottom: '20px',
                  }}
                >
                  <Editor
                    apiKey='z1imaefgqfqi5gkj9tp9blogndyf2gp0aj3fgubdtz73p658'
                    init={{
                      extended_valid_elements : "script[src|async|defer|type|charset]",
                      height: 500,
                      menubar: 'tools',
                      plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount',
                        'codesample code',
                      ],
                      toolbar:
                        'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | codesample | code'
                    }}
                    onChange={this.handleEditorChange}
                  />
                </div>
                <ul
                  style={{
                    display: "inline",
                  }}>
                  <li style={{display: "inline"}}>
                    <p style={{marginBottom: "0px", marginTop: "0px", position: "absolute", color: "#333"}}>Tags:</p>
                  </li>
                  <li style={{display: "inline", marginLeft: "45px", marginTop: "-20px"}}>
                    <Input
                        type="text"
                        id="tags"
                        name="tags"
                        value={tags}
                        autoComplete="off"
                        style={{  
                          color: "#333",
                          fontSize: "16px",
                          fontWeight: "100",
                        }}
                        onChange={this.onChangeTags}
                        required
                    />
                  </li>
                </ul>
                {warningDiv}
                <Button>Publish</Button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }
}
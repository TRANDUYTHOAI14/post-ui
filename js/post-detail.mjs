import postsAPI from './api/postApi.js'
import AppConstants from './appConstants.js'
import utils from './utils.js'

const renderPostDetail = (post) => {
	const postDetailElement = document.querySelector('.post-detail')
	if (!postDetailElement) return

	// set title
	const postTitleElement = postDetailElement.querySelector('#postDetailTitle')
	if (postTitleElement) postTitleElement.textContent = post.title

	// set author
	const postAuthorElement = postDetailElement.querySelector('#postDetailAuthor')
	if (postAuthorElement) postAuthorElement.textContent = post.author

	// set time
	const postTimeElement = postDetailElement.querySelector('#postDetailTimeSpan')
	if (postTimeElement) postTimeElement.textContent = ` - ${utils.formatDate(post.createdAt)}`

	// set description
	const descriptionElement = postDetailElement.querySelector('#postDetailDescription')
	if (descriptionElement) descriptionElement.textContent = post.description

	const postImageElement = document.querySelector('#postHeroImage')
	if (postImageElement) postImageElement.style.backgroundImage = `url(${post.imageUrl})`
}

;(async function () {
	const params = new URLSearchParams(window.location.search)
	const postId = params.get('id')

	const post = await postsAPI.get(postId)

	renderPostDetail(post)

	// show button edit page link
	const goToEditPageLink = document.querySelector('#goToEditPageLink')
	if (goToEditPageLink) {
		goToEditPageLink.href = `add-edit-post.html?postId=${post.id}`
		goToEditPageLink.innerHTML = '<i class="fas fa-edit"></i> Edit post'
	}
})()

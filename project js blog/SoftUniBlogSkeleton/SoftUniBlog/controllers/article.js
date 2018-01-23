
const Article = require('mongoose').model('Article');
module.exports= {
    createGet: (req, res) => {
        res.render('article/create');
    },
    createPost: (reg, res ) => {
        let articleArgs = reg.body;


        let errorMsg = '';
        if (!reg.isAuthenticated()){
            errorMsg= 'You should be logged in to make article!';
        }else if (!articleArgs.title) {
            errorMsg = 'Invalid title!';
        }else if (!articleArgs.content) {
            errorMsg = 'invalid content!';
        }

        if (errorMsg) {
            res.render('article/create', {error: errorMsg})
            return ;
        }
        articleArgs.author = reg.user.id;
        Article.create(articleArgs).then(article => {
            reg.user.articles.push(article.id);
            reg.user.save(err => {
                if (err) {
                    res.redirect('/', {error:err.message});
                }else  {
                    res.redirect('/');
                }
            });
            });
    },

    detailsGet:(req, res) => {
        let id = req.params.id;

        Article.findById(id).populate('author').then(article => {
            res.render('article/details', article)
        });
    },

    editGet:(req, res) => {
        let id = req.params.id;

        Article.findById(id).then(article => {
            res.render('article/edit', article)
        });
    },
    editPost:(req, res)=> {
        let id = req.params.id;

        let articleArgs = req.body;

        let errorMsg = '';
        if (!articleArgs.title) {
            errorMsg = 'Article title connot be empty!';
        }else if (!articleArgs.content){
            errorMsg = 'Article content connot be empty';
        }

        if (errorMsg){
            res.render('article/edit', {error: errorMsg})
        }else {
            Article.update({_id: id}, {$set: {title: articleArgs.title, content:articleArgs.content}})
                .then(updateStatus => {
                res.redirect(`/article/details/${id}`);
            })
        }
    },
    deleteGet: (req,res) => {
        let id = req.params.id;

        Article.findById(id).then(article => {
            res.render('article/delete', article)
        });
    },
    deletePost: (req,res) => {
        let id = req.params.id;
        Article.findOneAndRemove({_id: id}).populate('author').then(article => {
            let author = article.author;

            let index = author.articles.indexOf(article.id);

            if (index < 0){
                let errorMsg = 'Article was not found for that author!';
                res.render('article/delete', {error:errorMsg})
            }else {
                let count = 1;
                author.articles.splice(index,count);
                author.save().then((user) => {
                    res.redirect('/')
                });
            }

        })

    }
};
